import { getSingleCache } from '../../../lib/db/cache'
import { Types } from '../../../types/Components'

export default async function apiColumn(req, res) {
  res.status(200).json(await getSingleCache(Types.column, req.query.id, false))
}
