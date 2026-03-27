import { createStorageOperations } from '../providers/storage'
import { useStorageStore } from '../stores/storage'
import type { StorageConfig } from '../core/storage'

export function useNewStorage() {
  const storageStore = useStorageStore()

  const getActiveConfig = (): StorageConfig => {
    const repo = storageStore.activeRepo
    if (repo === 'local') {
      return { type: 'local' }
    }
    const remoteConfig = storageStore.remoteRepos[repo]
    if (!remoteConfig?.connected) {
      throw new Error(`${repo} 未连接`)
    }
    if (repo === 'github') {
      return {
        type: 'github',
        token: remoteConfig.token,
        username: remoteConfig.username!,
        repo: remoteConfig.repo,
        branch: remoteConfig.branch,
        basePath: remoteConfig.basePath
      }
    }
    return {
      type: 'gitee',
      token: remoteConfig.token,
      username: remoteConfig.username!,
      repo: remoteConfig.repo,
      branch: remoteConfig.branch,
      basePath: remoteConfig.basePath
    }
  }

  const getStorageOperations = () => {
    const config = getActiveConfig()
    return createStorageOperations(config)
  }

  return {
    getStorageOperations,
    getActiveConfig
  }
}
