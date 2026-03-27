import type { StorageConfig, StorageOperations } from '../../core/storage'
import { createLocalFS } from './local'

export function createStorageOperations(config: StorageConfig): StorageOperations {
  switch (config.type) {
    case 'local':
      return createLocalFS()
    case 'github':
      // TODO: 实现 GitHub 提供者
      throw new Error('GitHub provider not implemented yet')
    case 'gitee':
      // TODO: 实现 Gitee 提供者
      throw new Error('Gitee provider not implemented yet')
    default:
      throw new Error(`Unsupported storage type: ${(config as any).type}`)
  }
}
