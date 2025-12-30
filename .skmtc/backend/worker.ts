
import toWorker from 'jsr:@skmtc/worker'
import skmtcGenZod from '@skmtc/gen-zod'
import skmtcGenTypescript from '@skmtc/gen-typescript'
import skmtcGenSupabaseHono from '@skmtc/gen-supabase-hono'

export default toWorker(() => Object.fromEntries([skmtcGenZod,
skmtcGenTypescript,
skmtcGenSupabaseHono].map(g => [g.id, g])))