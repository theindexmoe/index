// docker run --name index-cache -d -p 6379:6379 redis
import Redis from 'ioredis'
import * as process from 'process'
import { Types } from '../../types/Components'
import { singularToPlural } from '../utils'
import { findOneTyped, getAllTyped } from './dbTyped'

const uri =
  'CACHE_URL' in process.env ? process.env.CACHE_URL : 'redis://localhost'
if (typeof uri !== 'string') {
  throw Error('Unable to connect to DB due to missing DATABASE_URL')
}
const client = new Redis(uri)

/**
 * only returns null if requested component does not exist
 */
export async function getSingleCache(
  type: Types,
  _id: string
): Promise<object | null> {
  let data = await getCache(type + '-' + _id)
  if (data === null) {
    data = (await findOneTyped(type, _id)) as object

    if (data === null) {
      return null
    }

    await updateSingleCache(type, _id, data)
    return data
  }

  return data
}

/**
 * wrapper for setCache, ensuring consistent key naming
 */
export async function updateSingleCache(
  type: Types,
  _id: string,
  data?: string | object
) {
  if (typeof data === 'undefined') {
    data = (await findOneTyped(type, _id)) as object
  }

  await setCache(type + '-' + _id, data)
}

/**
 * only returns null if requested components do not exist or are empty
 */
export async function getAllCache(type: Types): Promise<object[]> {
  const plural = singularToPlural(type)

  let data = await getCache(plural)
  if (data === null) {
    data = await getAllTyped(type)

    if (data === null) {
      return []
    }

    await setCache(plural, data)
  }

  return data as object[]
}

/**
 * wrapper for setCache, ensuring consistent key naming
 */
export async function updateAllCache(type: Types, data?: string | object) {
  if (typeof data === 'undefined') {
    data = await getAllTyped(type)
  }

  await setCache(singularToPlural(type), data)
}

/**
 * only returns null if requested component does not exist
 */
export async function getCache(key: string): Promise<object | object[] | null> {
  try {
    let data = await client.get(key)
    if (data === null) {
      return null
    }

    try {
      return JSON.parse(data)
    } catch (e) {
      console.error('Failed to parse data from cache', data, e)
    }
  } catch (e) {
    console.error('Failed to get from cache', e)
  }
  return null
}

/**
 * only returns null if requested component does not exist
 */
export async function setCache(key: string, data: string | object) {
  if (typeof data === 'undefined' || data === null) {
    console.error('Updating cache', key, 'with invalid value', data)
  }

  if (typeof data !== 'string') {
    try {
      data = JSON.stringify(data)
    } catch (e) {
      return console.error('Failed to stringify data to set cache', data)
    }
  }

  try {
    return client.set(key, data)
  } catch (e) {
    console.error('Failed to set cache for key', key, data)
  }
}

export async function clearSingleCache(type: Types, _id: string) {
  return await clearCache(type + '-' + _id)
}

export async function clearCache(key: string) {
  try {
    return await client.del(key)
  } catch (e) {
    console.error('Failed te delete cache', key, e)
  }
}

export async function clearCompleteCache() {
  try {
    return await client.flushall()
  } catch (e) {
    return console.error('Failed to flush cache', e)
  }
}
