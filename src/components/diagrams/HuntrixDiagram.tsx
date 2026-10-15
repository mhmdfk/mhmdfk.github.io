import { ui } from '../../content/content'
import { FlowSteps } from './FlowSteps'

export function HuntrixDiagram() {
  const copy = ui.caseStudy.diagrams.huntrix
  return (
    <div className="case-diagram">
      <svg
        className="diagram-wide"
        viewBox="0 0 1020 90"
        role="img"
        aria-labelledby="huntrix-diagram-wide"
      >
        <title id="huntrix-diagram-wide">{copy.title}</title>
        <FlowSteps steps={copy.steps} orientation="row" />
      </svg>
      <svg
        className="diagram-narrow"
        viewBox="0 0 300 435"
        role="img"
        aria-labelledby="huntrix-diagram-narrow"
      >
        <title id="huntrix-diagram-narrow">{copy.title}</title>
        <FlowSteps steps={copy.steps} orientation="column" />
      </svg>
    </div>
  )
}
