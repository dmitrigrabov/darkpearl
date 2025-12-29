import { useMutation } from '@tanstack/react-query'
import { lawnDetectionApi } from '@/lib/api'
import type { LawnDetectionRequest } from '@/types/api.types'

export function useLawnDetection() {
  return useMutation({
    mutationFn: (params: LawnDetectionRequest) => lawnDetectionApi.detect(params),
  })
}
