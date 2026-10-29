import {randomUUID} from 'node:crypto';
const columns = 'id,title,industry,difficulty';
export class CaseRepository {
  constructor(db) {this.db = db;}
  async list({kw = '',industry = '',difficulty = '',offset = 0,limit = 10} = {}) {
    const values = [kw,industry,difficulty];
    const where = "WHERE ($1='' OR strpos(title,$1)>0) AND ($2='' OR industry=$2) AND ($3='' OR difficulty=$3)";
    // 同一快照内计算总数与当前页；不是用本页长度充当total。
    return this.db.transaction(async tx => {
      await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const count = await tx.query(`SELECT COUNT(*)::int AS total FROM cases ${where}`, values);
      const page = await tx.query(`SELECT ${columns} FROM cases ${where} ORDER BY created_at,id LIMIT $4 OFFSET $5`, [...values,limit,offset]);
      return {items: page.rows,total: count.rows[0].total,offset,limit};
    });
  }
  async get(id) {return (await this.db.query(`SELECT ${columns} FROM cases WHERE id=$1`, [id])).rows[0];}
  async create(fields) {
    return (await this.db.query(`INSERT INTO cases(id,title,industry,difficulty) VALUES($1,$2,$3,$4) RETURNING ${columns}`,
      [randomUUID(),fields.title,fields.industry,fields.difficulty])).rows[0];
  }
  async createWithTags(fields, tagIds) {
    return this.db.transaction(async tx => {
      const item = await new CaseRepository(tx).create(fields);
      for (const tagId of tagIds) await tx.query('INSERT INTO case_tags(case_id,tag_id) VALUES($1,$2)', [item.id,tagId]);
      return item;
    });
  }
}
