
import toWorker from 'jsr:@skmtc/worker'
import skmtcGenZod from '@skmtc/gen-zod'
import skmtcGenTypescript from '@skmtc/gen-typescript'

export default toWorker(() => Object.fromEntries([skmtcGenZod,
skmtcGenTypescript].map(g => [g.id, g])))