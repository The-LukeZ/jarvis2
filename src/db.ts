// =================== TYPES ===================
// types for reputation system

export interface Trade {
  id: string;
  userId: string;
  partnerId: string;
  /**
   * if give, then userId is the giver
   * if receive, then userId is the receiver
   */
  type: "give" | "receive";
  item: string;
  timestamp: string;
  completedAt: string | null;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  messageId: string;
  tradeId: string;
  timestamp: string;
}

export interface User {
  userId: string;
  /**
   * Total reputation points of the user.
   *
   * No one can earn negative reputation points, but someone can earn less.
   */
  reputationPoints: number;
  blocked: boolean;
}

// =================== DB Helper ===================

export class DBHelper {
  readonly db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  private handleBoolean(value: number | null): boolean {
    return value === 1;
  }

  private userFromRow(row: any): User {
    return {
      userId: row.userId,
      reputationPoints: row.reputationPoints,
      blocked: this.handleBoolean(row.blocked),
    };
  }

  async isBlocked(userId: string): Promise<boolean> {
    const result = await this.db.prepare("SELECT blocked FROM users WHERE userId = ?").bind(userId).first<{ blocked: number }>();
    return result?.blocked === 1;
  }

  async getUser(userId: string): Promise<User | null> {
    const result = await this.db.prepare("SELECT * FROM users WHERE userId = ?").bind(userId).first<User>();
    return result ? this.userFromRow(result) : null;
  }

  /**
   * Note, that userId and partnerId are interchangeable in trades.\
   * Any trade between user A and user B counts for both A and B.
   */
  async userTradeCountWithPartner(userId: string, partnerId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM trades
      WHERE (userId = ? AND partnerId = ?) OR (userId = ? AND partnerId = ?)
    `;
    const params = [userId, partnerId, partnerId, userId];
    const result = await this.db
      .prepare(query)
      .bind(...params)
      .first<{ count: number }>();
    return result?.count ?? 0;
  }

  async userTotalTradeCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM trades
      WHERE userId = ? OR partnerId = ?
    `;
    const params = [userId, userId];
    const result = await this.db
      .prepare(query)
      .bind(...params)
      .first<{ count: number }>();
    return result?.count ?? 0;
  }

  /**
   * Retrieves all trades involving the specified user, sorted by most recent first.
   *
   * @param userId - The ID of the user whose trades are to be retrieved.
   * @returns An array of Trade objects involving the user.
   */
  async getUserTrades(userId: string): Promise<{ giver: Trade[]; receiver: Trade[] }> {
    const query = `
      SELECT *
      FROM trades
      WHERE userId = ? OR partnerId = ?
      ORDER BY timestamp DESC
    `;
    const params = [userId, userId];
    const result = await this.db
      .prepare(query)
      .bind(...params)
      .all<Trade>();
    return {
      giver: result.results.filter((trade) => trade.type === "give" && trade.userId === userId),
      receiver: result.results.filter((trade) => trade.type === "receive" && trade.userId === userId),
    };
  }
}
