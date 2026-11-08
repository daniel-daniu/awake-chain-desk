import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container-page py-16">
          <div className="card card-pad mx-auto max-w-xl">
            <h1 className="text-[20px] font-semibold">页面加载失败 / Page error</h1>
            <p className="mt-2 text-[12px] text-muted">{this.state.error.message}</p>
            <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>
              重新加载 / Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
