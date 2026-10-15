import { ui } from '../../content/content'
import { FlowSteps } from './FlowSteps'

export function MatjariDiagram() {
  const copy = ui.caseStudy.diagrams.matjari
  return (
    <div className="case-diagram">
      <svg
        className="diagram-wide"
        viewBox="0 0 810 220"
        role="img"
        aria-labelledby="matjari-diagram-wide"
      >
        <title id="matjari-diagram-wide">{copy.title}</title>
        <FlowSteps steps={copy.steps} orientation="row" />
        <path d="M 510 75 v 30 H 300 v 35 m -5 -6 l 5 6 5 -6 M 510 105 h 140 v 35 m -5 -6 l 5 6 5 -6" />
        <rect x="210" y="145" width="180" height="70" rx="6" />
        <text x="300" y="175">
          {copy.imageSearch[0]}
          <tspan x="300" dy="22">
            {copy.imageSearch[1]}
          </tspan>
        </text>
        <rect x="560" y="145" width="180" height="70" rx="6" />
        <text x="650" y="185">
          {copy.chat[0]}
        </text>
      </svg>
      <svg
        className="diagram-narrow"
        viewBox="0 0 300 460"
        role="img"
        aria-labelledby="matjari-diagram-narrow"
      >
        <title id="matjari-diagram-narrow">{copy.title}</title>
        <FlowSteps
          steps={copy.steps}
          orientation="column"
          boxWidth={170}
          step={85}
        />
        <path d="M 65 200 H 12 v 145 h 63 v 30 m -5 -6 l 5 6 5 -6 M 235 200 h 53 v 145 h -63 v 30 m -5 -6 l 5 6 5 -6" />
        <rect x="5" y="380" width="140" height="70" rx="6" />
        <text x="75" y="407">
          {copy.imageSearch[0]}
          <tspan x="75" dy="22">
            {copy.imageSearch[1]}
          </tspan>
        </text>
        <rect x="155" y="380" width="140" height="70" rx="6" />
        <text x="225" y="420">
          {copy.chat[0]}
        </text>
      </svg>
    </div>
  )
}
