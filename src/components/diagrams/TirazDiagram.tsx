import { ui } from '../../content/content'
import { FlowSteps } from './FlowSteps'

export function TirazDiagram() {
  const copy = ui.caseStudy.diagrams.tiraz
  return (
    <div className="case-diagram">
      <svg
        className="diagram-wide"
        viewBox="0 0 1230 90"
        role="img"
        aria-labelledby="tiraz-diagram-wide"
      >
        <title id="tiraz-diagram-wide">{copy.title}</title>
        <FlowSteps steps={copy.steps} orientation="row" />
      </svg>
      <svg
        className="diagram-narrow"
        viewBox="0 0 300 525"
        role="img"
        aria-labelledby="tiraz-diagram-narrow"
      >
        <title id="tiraz-diagram-narrow">{copy.title}</title>
        <FlowSteps steps={copy.steps} orientation="column" />
      </svg>
    </div>
  )
}
