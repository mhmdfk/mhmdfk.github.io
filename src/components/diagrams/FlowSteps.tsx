type FlowStepsProps = {
  steps: readonly string[]
  orientation: 'row' | 'column'
  boxWidth?: number
  step?: number
}

export function FlowSteps({
  steps,
  orientation,
  boxWidth,
  step,
}: FlowStepsProps) {
  const horizontal = orientation === 'row'
  const width = boxWidth ?? (horizontal ? 178 : 260)
  const spacing = step ?? (horizontal ? 210 : 90)

  return steps.map((label, index) => {
    const x = horizontal ? index * spacing + 1 : 150 - width / 2
    const y = horizontal ? 15 : index * spacing + 1
    return (
      <g key={label}>
        <rect x={x} y={y} width={width} height={horizontal ? 60 : 58} rx="6" />
        <text x={x + width / 2} y={y + (horizontal ? 35 : 34)}>
          {label}
        </text>
        {index < steps.length - 1 && (
          <path
            d={
              horizontal
                ? `M ${x + width + 3} 45 h ${spacing - width - 8} m -6 -5 l 6 5 -6 5`
                : `M 150 ${y + 61} v ${spacing - 66} m -5 -6 l 5 6 5 -6`
            }
          />
        )}
      </g>
    )
  })
}
