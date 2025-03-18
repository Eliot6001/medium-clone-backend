import { supabase as supabaseInstance } from '../config/supabaseClient';


interface ModerationData {
    id: string;
    postid: string;
    moderator_id: string;
    deleted_at: string;
    reason?: string;
    active?: boolean;
}
const getModerationData = async (postId: string): Promise<ModerationData & { moderatorProfile?: { id: string; username: string } } | null> => {
    try {
        const { data, error } = await supabaseInstance
            .from('article_moderation')
            .select(`
                *,
                user_profiles (
                    id,
                    username
                )
            `)
            .eq('postid', postId)
            .eq('active', true)
            .maybeSingle()

        if (error) {
            console.error('Error fetching moderation data:', error);
            return null;
        }
        if (!data) {
            console.log('No moderation data found for postId:', postId);
            return null;
          }
        const { moderator_profile: moderatorProfile, ...moderationData } = data;

        return {
            ...moderationData,
            moderatorProfile,
        } as ModerationData & { moderatorProfile?: { id: string; username: string } };
    } catch (err) {
        console.error('Unexpected error:', err);
        return null;
    }
};

export {getModerationData}