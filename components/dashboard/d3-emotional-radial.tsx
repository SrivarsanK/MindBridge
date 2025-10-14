"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

export interface EmotionData {
  emotion: string
  value: number
  color?: string
}

interface D3EmotionalRadialChartProps {
  emotions: EmotionData[]
  width?: number
  height?: number
  className?: string
}

const emotionColors: Record<string, string> = {
  happy: "#10b981",
  joy: "#fbbf24",
  peace: "#06b6d4",
  calm: "#3b82f6",
  love: "#ec4899",
  excited: "#f59e0b",
  fear: "#ef4444",
  anxiety: "#dc2626",
  sad: "#6366f1",
  angry: "#b91c1c",
  stress: "#ea580c",
  worry: "#f97316",
}

export function D3EmotionalRadialChart({
  emotions,
  width = 400,
  height = 400,
  className = ""
}: D3EmotionalRadialChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !emotions || emotions.length === 0) return

    const svg = d3.select(svgRef.current)
    const tooltip = d3.select(tooltipRef.current)
    
    // Clear previous content
    svg.selectAll("*").remove()

    const radius = Math.min(width, height) / 2 - 40
    const centerX = width / 2
    const centerY = height / 2

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY})`)

    // Add radial gradient background
    const defs = svg.append("defs")
    const radialGradient = defs
      .append("radialGradient")
      .attr("id", "radial-bg")

    radialGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "hsl(var(--primary))")
      .attr("stop-opacity", 0.05)

    radialGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "hsl(var(--primary))")
      .attr("stop-opacity", 0)

    // Background circle
    g.append("circle")
      .attr("r", radius)
      .attr("fill", "url(#radial-bg)")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 1)
      .attr("opacity", 0.2)

    // Create angle scale
    const angleScale = d3
      .scaleBand()
      .domain(emotions.map(d => d.emotion))
      .range([0, 2 * Math.PI])
      .padding(0.1)

    // Create radial scale
    const radiusScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, radius])

    // Draw concentric circles (grid)
    const gridLevels = [0.25, 0.5, 0.75, 1]
    gridLevels.forEach(level => {
      g.append("circle")
        .attr("r", radiusScale(level))
        .attr("fill", "none")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "2,2")
        .attr("opacity", 0.1)

      // Add level labels
      g.append("text")
        .attr("x", 5)
        .attr("y", -radiusScale(level))
        .attr("text-anchor", "start")
        .attr("fill", "currentColor")
        .attr("opacity", 0.4)
        .style("font-size", "10px")
        .text(`${(level * 100).toFixed(0)}%`)
    })

    // Create arc generator
    const arc = d3.arc<EmotionData>()
      .innerRadius(0)
      .outerRadius(d => radiusScale(d.value))
      .startAngle(d => angleScale(d.emotion) || 0)
      .endAngle(d => (angleScale(d.emotion) || 0) + angleScale.bandwidth())
      .padAngle(0.02)
      .cornerRadius(4)

    // Draw emotion wedges
    const wedges = g
      .selectAll(".wedge")
      .data(emotions)
      .enter()
      .append("g")
      .attr("class", "wedge")

    wedges
      .append("path")
      .attr("d", arc)
      .attr("fill", d => d.color || emotionColors[d.emotion.toLowerCase()] || "#6366f1")
      .attr("opacity", 0.8)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("stroke-width", 3)

        tooltip
          .style("visibility", "visible")
          .html(`
            <div class="font-medium capitalize">${d.emotion}</div>
            <div class="text-xs">Intensity: ${(d.value * 100).toFixed(0)}%</div>
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("stroke-width", 2)

        tooltip.style("visibility", "hidden")
      })
      .on("click", function(event, d) {
        // Pulse animation
        d3.select(this)
          .transition()
          .duration(300)
          .attr("transform", "scale(1.1)")
          .transition()
          .duration(300)
          .attr("transform", "scale(1)")
      })

    // Add emotion labels
    wedges
      .append("text")
      .attr("transform", d => {
        const angle = ((angleScale(d.emotion) || 0) + angleScale.bandwidth() / 2)
        const labelRadius = radius + 20
        const x = Math.sin(angle) * labelRadius
        const y = -Math.cos(angle) * labelRadius
        return `translate(${x},${y})`
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "11px")
      .style("font-weight", "500")
      .text(d => d.emotion.charAt(0).toUpperCase() + d.emotion.slice(1))

    // Add center circle with total
    const avgValue = d3.mean(emotions, d => d.value) || 0
    
    g.append("circle")
      .attr("r", 30)
      .attr("fill", "hsl(var(--background))")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 2)

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "hsl(var(--primary))")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${(avgValue * 100).toFixed(0)}%`)

    g.append("text")
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .attr("opacity", 0.6)
      .style("font-size", "10px")
      .text("Average")

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Emotional Intensity Radar")

    // Animate entrance
    wedges.select("path")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr("opacity", 0.8)

  }, [emotions, width, height])

  return (
    <div className={`relative ${className}`}>
      <svg 
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-auto"
        style={{ maxWidth: "100%" }}
      />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none rounded-lg border bg-popover p-2 shadow-md text-popover-foreground text-xs z-50"
        style={{ visibility: "hidden" }}
      />
    </div>
  )
}
