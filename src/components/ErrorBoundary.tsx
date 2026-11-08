import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * 兜底错误边界：某个组件渲染抛错时，显示提示而不是整页白屏。
 * 路由切换时由上层用 key 重置。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[error-boundary]', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="container-page py-20 text-center">
        <div className="text-[15px] font-semibold text-ink">页面渲染出错 · Something went wrong</div>
        <p className="mx-auto mt-2 max-w-lg text-[12px] leading-relaxed text-muted">
          数据可能暂时不完整，刷新一下通常就能恢复。如果持续出现，请把下面这行信息发给我。
        </p>
        <pre className="mono mx-auto mt-4 max-w-xl overflow-auto rounded-lg border border-line bg-white p-3 text-left text-[10px] leading-relaxed text-muted">
          {String(error.message || error)}
        </pre>
        <button className="btn btn-primary btn-sm mt-5" onClick={() => window.location.reload()}>
          刷新页面
        </button>
      </div>
    )
  }
}
