// Fashion Interactions Repository - Enterprise-grade interaction data access
import { eq, and, count, desc, sql } from 'drizzle-orm';
import { db } from '../db.js';
import { 
  fashionLikes, 
  fashionComments, 
  fashionMessages, 
  fashionListings,
  users 
} from '@shared/fashion-schema';
import { Logger } from '../middleware/Logger.js';

export interface FashionLike {
  id: string;
  userId: string;
  fashionListingId: string;
  createdAt: Date;
}

export interface FashionComment {
  id: string;
  userId: string;
  fashionListingId: string;
  content: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FashionMessage {
  id: string;
  senderId: string;
  receiverId: string;
  fashionListingId?: string;
  content: string;
  isRead: boolean;
  messageType: string;
  offerAmount?: number;
  createdAt: Date;
}

export interface CommentWithUser extends FashionComment {
  user: {
    username: string;
    profileImageUrl?: string;
    isVerified: boolean;
  };
  replies?: CommentWithUser[];
}

export class FashionInteractionsRepository {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('FashionInteractionsRepository');
  }

  // Like operations
  async createLike(userId: string, fashionListingId: string): Promise<FashionLike> {
    try {
      const [like] = await db
        .insert(fashionLikes)
        .values({
          userId,
          fashionListingId,
          createdAt: new Date()
        })
        .returning();

      this.logger.debug('Fashion like created', { userId, fashionListingId });
      return like;

    } catch (error) {
      this.logger.error('Failed to create fashion like', {
        userId,
        fashionListingId,
        error: error.message
      });
      throw error;
    }
  }

  async deleteLike(userId: string, fashionListingId: string): Promise<void> {
    try {
      await db
        .delete(fashionLikes)
        .where(
          and(
            eq(fashionLikes.userId, userId),
            eq(fashionLikes.fashionListingId, fashionListingId)
          )
        );

      this.logger.debug('Fashion like deleted', { userId, fashionListingId });

    } catch (error) {
      this.logger.error('Failed to delete fashion like', {
        userId,
        fashionListingId,
        error: error.message
      });
      throw error;
    }
  }

  async checkIfLiked(userId: string, fashionListingId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: fashionLikes.id })
        .from(fashionLikes)
        .where(
          and(
            eq(fashionLikes.userId, userId),
            eq(fashionLikes.fashionListingId, fashionListingId)
          )
        )
        .limit(1);

      return result.length > 0;

    } catch (error) {
      this.logger.error('Failed to check if liked', {
        userId,
        fashionListingId,
        error: error.message
      });
      return false;
    }
  }

  async getLikesByListing(fashionListingId: string): Promise<FashionLike[]> {
    try {
      const likes = await db
        .select()
        .from(fashionLikes)
        .where(eq(fashionLikes.fashionListingId, fashionListingId))
        .orderBy(desc(fashionLikes.createdAt));

      return likes;

    } catch (error) {
      this.logger.error('Failed to get likes by listing', {
        fashionListingId,
        error: error.message
      });
      return [];
    }
  }

  // Comment operations
  async createComment(
    userId: string,
    fashionListingId: string,
    content: string,
    parentCommentId?: string
  ): Promise<FashionComment> {
    try {
      const [comment] = await db
        .insert(fashionComments)
        .values({
          userId,
          fashionListingId,
          content,
          parentCommentId,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      this.logger.debug('Fashion comment created', {
        userId,
        fashionListingId,
        parentCommentId
      });

      return comment;

    } catch (error) {
      this.logger.error('Failed to create fashion comment', {
        userId,
        fashionListingId,
        content,
        error: error.message
      });
      throw error;
    }
  }

  async updateComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<FashionComment> {
    try {
      const [comment] = await db
        .update(fashionComments)
        .set({
          content,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(fashionComments.id, commentId),
            eq(fashionComments.userId, userId)
          )
        )
        .returning();

      if (!comment) {
        throw new Error('Comment not found or access denied');
      }

      this.logger.debug('Fashion comment updated', { commentId, userId });
      return comment;

    } catch (error) {
      this.logger.error('Failed to update fashion comment', {
        commentId,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      await db
        .delete(fashionComments)
        .where(
          and(
            eq(fashionComments.id, commentId),
            eq(fashionComments.userId, userId)
          )
        );

      this.logger.debug('Fashion comment deleted', { commentId, userId });

    } catch (error) {
      this.logger.error('Failed to delete fashion comment', {
        commentId,
        userId,
        error: error.message
      });
      throw error;
    }
  }

  async getCommentsByListing(
    fashionListingId: string,
    includeReplies: boolean = true
  ): Promise<CommentWithUser[]> {
    try {
      // Get all comments for the listing
      const comments = await db
        .select({
          id: fashionComments.id,
          userId: fashionComments.userId,
          fashionListingId: fashionComments.fashionListingId,
          content: fashionComments.content,
          parentCommentId: fashionComments.parentCommentId,
          createdAt: fashionComments.createdAt,
          updatedAt: fashionComments.updatedAt,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified
        })
        .from(fashionComments)
        .leftJoin(users, eq(fashionComments.userId, users.id))
        .where(eq(fashionComments.fashionListingId, fashionListingId))
        .orderBy(desc(fashionComments.createdAt));

      if (!includeReplies) {
        return comments
          .filter(comment => !comment.parentCommentId)
          .map(this.mapCommentWithUser);
      }

      // Organize comments into parent-child structure
      const parentComments = comments.filter(comment => !comment.parentCommentId);
      const replies = comments.filter(comment => comment.parentCommentId);

      const commentsWithReplies = parentComments.map(parent => {
        const commentReplies = replies
          .filter(reply => reply.parentCommentId === parent.id)
          .map(this.mapCommentWithUser);

        return {
          ...this.mapCommentWithUser(parent),
          replies: commentReplies
        };
      });

      return commentsWithReplies;

    } catch (error) {
      this.logger.error('Failed to get comments by listing', {
        fashionListingId,
        error: error.message
      });
      return [];
    }
  }

  // Message operations
  async createMessage(
    senderId: string,
    receiverId: string,
    content: string,
    fashionListingId?: string,
    messageType: string = 'text',
    offerAmount?: number
  ): Promise<FashionMessage> {
    try {
      const [message] = await db
        .insert(fashionMessages)
        .values({
          senderId,
          receiverId,
          fashionListingId,
          content,
          messageType,
          offerAmount,
          isRead: false,
          createdAt: new Date()
        })
        .returning();

      this.logger.debug('Fashion message created', {
        senderId,
        receiverId,
        fashionListingId,
        messageType
      });

      return message;

    } catch (error) {
      this.logger.error('Failed to create fashion message', {
        senderId,
        receiverId,
        content,
        error: error.message
      });
      throw error;
    }
  }

  async markMessageAsRead(messageId: string, receiverId: string): Promise<void> {
    try {
      await db
        .update(fashionMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(fashionMessages.id, messageId),
            eq(fashionMessages.receiverId, receiverId)
          )
        );

      this.logger.debug('Fashion message marked as read', { messageId, receiverId });

    } catch (error) {
      this.logger.error('Failed to mark message as read', {
        messageId,
        receiverId,
        error: error.message
      });
      throw error;
    }
  }

  async getConversation(
    userId1: string,
    userId2: string,
    fashionListingId?: string,
    limit: number = 50
  ): Promise<FashionMessage[]> {
    try {
      let whereCondition;

      if (fashionListingId) {
        whereCondition = and(
          or(
            and(
              eq(fashionMessages.senderId, userId1),
              eq(fashionMessages.receiverId, userId2)
            ),
            and(
              eq(fashionMessages.senderId, userId2),
              eq(fashionMessages.receiverId, userId1)
            )
          ),
          eq(fashionMessages.fashionListingId, fashionListingId)
        );
      } else {
        whereCondition = or(
          and(
            eq(fashionMessages.senderId, userId1),
            eq(fashionMessages.receiverId, userId2)
          ),
          and(
            eq(fashionMessages.senderId, userId2),
            eq(fashionMessages.receiverId, userId1)
          )
        );
      }

      const messages = await db
        .select()
        .from(fashionMessages)
        .where(whereCondition)
        .orderBy(desc(fashionMessages.createdAt))
        .limit(limit);

      return messages.reverse(); // Return in chronological order

    } catch (error) {
      this.logger.error('Failed to get conversation', {
        userId1,
        userId2,
        fashionListingId,
        error: error.message
      });
      return [];
    }
  }

  async getUserConversations(userId: string): Promise<Array<{
    otherUserId: string;
    otherUsername: string;
    lastMessage: FashionMessage;
    unreadCount: number;
  }>> {
    try {
      // This would require a more complex query to get the latest message
      // and unread count for each conversation
      const conversations = await db.execute(sql`
        WITH latest_messages AS (
          SELECT DISTINCT ON (
            CASE 
              WHEN sender_id = ${userId} THEN receiver_id 
              ELSE sender_id 
            END
          )
            CASE 
              WHEN sender_id = ${userId} THEN receiver_id 
              ELSE sender_id 
            END as other_user_id,
            fm.*
          FROM fashion_messages fm
          WHERE sender_id = ${userId} OR receiver_id = ${userId}
          ORDER BY 
            CASE 
              WHEN sender_id = ${userId} THEN receiver_id 
              ELSE sender_id 
            END,
            created_at DESC
        ),
        unread_counts AS (
          SELECT 
            sender_id as other_user_id,
            COUNT(*) as unread_count
          FROM fashion_messages
          WHERE receiver_id = ${userId} AND is_read = false
          GROUP BY sender_id
        )
        SELECT 
          lm.*,
          u.username as other_username,
          COALESCE(uc.unread_count, 0) as unread_count
        FROM latest_messages lm
        LEFT JOIN users u ON u.id = lm.other_user_id
        LEFT JOIN unread_counts uc ON uc.other_user_id = lm.other_user_id
        ORDER BY lm.created_at DESC
      `);

      return conversations.map((row: any) => ({
        otherUserId: row.other_user_id,
        otherUsername: row.other_username,
        lastMessage: {
          id: row.id,
          senderId: row.sender_id,
          receiverId: row.receiver_id,
          fashionListingId: row.fashion_listing_id,
          content: row.content,
          isRead: row.is_read,
          messageType: row.message_type,
          offerAmount: row.offer_amount,
          createdAt: row.created_at
        },
        unreadCount: row.unread_count
      }));

    } catch (error) {
      this.logger.error('Failed to get user conversations', {
        userId,
        error: error.message
      });
      return [];
    }
  }

  // Analytics operations
  async getInteractionStats(fashionListingId: string): Promise<{
    likesCount: number;
    commentsCount: number;
    messagesCount: number;
  }> {
    try {
      const [likes, comments, messages] = await Promise.all([
        db
          .select({ count: count() })
          .from(fashionLikes)
          .where(eq(fashionLikes.fashionListingId, fashionListingId)),
        
        db
          .select({ count: count() })
          .from(fashionComments)
          .where(eq(fashionComments.fashionListingId, fashionListingId)),
        
        db
          .select({ count: count() })
          .from(fashionMessages)
          .where(eq(fashionMessages.fashionListingId, fashionListingId))
      ]);

      return {
        likesCount: likes[0]?.count || 0,
        commentsCount: comments[0]?.count || 0,
        messagesCount: messages[0]?.count || 0
      };

    } catch (error) {
      this.logger.error('Failed to get interaction stats', {
        fashionListingId,
        error: error.message
      });
      return {
        likesCount: 0,
        commentsCount: 0,
        messagesCount: 0
      };
    }
  }

  private mapCommentWithUser(comment: any): CommentWithUser {
    return {
      id: comment.id,
      userId: comment.userId,
      fashionListingId: comment.fashionListingId,
      content: comment.content,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        username: comment.username || 'Unknown User',
        profileImageUrl: comment.profileImageUrl,
        isVerified: comment.isVerified || false
      }
    };
  }
}

// Factory function
export function createFashionInteractionsRepository(): FashionInteractionsRepository {
  return new FashionInteractionsRepository();
}
