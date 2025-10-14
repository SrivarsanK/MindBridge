"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

export interface D3DreamSegment {
  stage: "deep" | "rem" | "light" | "awake" | "lucid"
  startTime: Date
  endTime: Date
  emotion?: string
  intensity?: number
}

interface D3DreamTimelineProps {
  segments: D3DreamSegment[]
  width?: number
  height?: number
  className?: string
}

const stageColors = {
  deep: "#3b82f6",      // Blue
  rem: "#a855f7",       // Purple
  light: "#60a5fa",     // Light blue
  awake: "#f59e0b",     // Amber
  lucid: "#ec4899",     // Pink
}

const stageNames = {
  deep: "Deep Dream",
  rem: "REM Dream",
  light: "Light Dream",
  awake: "Awake",
  lucid: "Lucid Dream",
}

export function D3DreamTimeline({ 
  segments, 
  width = 800, 
  height = 200,
  className = ""
}: D3DreamTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !segments ||segments.length === 0) return

    const svg = d3.select(svgRef.current)
    const tooltip = d3.select(tooltipRef.current)
    
    // Clear previous content
    svg.selectAll("*").remove()

    // Margins
    const margin = { top: 30, right: 40, bottom: 50, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Time scale
    const startTime = d3.min(segments, d => d.startTime.getTime()) || 0
    const endTime = d3.max(segments, d => d.endTime.getTime()) || Date.now()

    const xScale = d3
      .scaleTime()
      .domain([new Date(startTime), new Date(endTime)])
      .range([0, innerWidth])

    // Stage scale (y-axis)
    const stages = ["awake", "lucid", "rem", "light", "deep"]
    const yScale = d3
      .scaleBand()
      .domain(stages)
      .range([0, innerHeight])
      .padding(0.2)

    // Add gradient definitions
    const defs = svg.append("defs")
    
    Object.entries(stageColors).forEach(([stage, color]) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `gradient-${stage}`)
        .attr("x1", "0%")
        .attr("x2", "100%")

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.8)

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 1)
    })

    // Draw segments
    const segmentGroups = g
      .selectAll(".segment")
      .data(segments)
      .enter()
      .append("g")
      .attr("class", "segment")

    segmentGroups
      .append("rect")
      .attr("x", d => xScale(d.startTime))
      .attr("y", d => yScale(d.stage) || 0)
      .attr("width", d => xScale(d.endTime) - xScale(d.startTime))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => `url(#gradient-${d.stage})`)
      .attr("rx", 4)
      .attr("stroke", d => stageColors[d.stage])
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 3)
          .attr("filter", "brightness(1.1)")

        const duration = d.endTime.getTime() - d.startTime.getTime()
        const minutes = Math.floor(duration / (1000 * 60))
        
        tooltip
          .style("visibility", "visible")
          .html(`
            <div class="font-medium">${stageNames[d.stage]}</div>
            <div class="text-xs text-muted-foreground">
              ${d.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
              ${d.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div class="text-xs">Duration: ${minutes}m</div>
            ${d.emotion ? `<div class="text-xs">Emotion: ${d.emotion}</div>` : ''}
            ${d.intensity ? `<div class="text-xs">Intensity: ${(d.intensity * 100).toFixed(0)}%</div>` : ''}
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 2)
          .attr("filter", "none")

        tooltip.style("visibility", "hidden")
      })

    // Add intensity indicators (circles)
    segmentGroups
      .filter(d => d.intensity !== undefined)
      .append("circle")
      .attr("cx", d => (xScale(d.startTime) + xScale(d.endTime)) / 2)
      .attr("cy", d => (yScale(d.stage) || 0) + yScale.bandwidth() / 2)
      .attr("r", d => 3 + (d.intensity || 0) * 5)
      .attr("fill", "white")
      .attr("opacity", 0.6)
      .style("pointer-events", "none")

    // X-axis (time)
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => d3.timeFormat("%I:%M %p")(d as Date))

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "currentColor")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")

    // Y-axis (stages)
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => stageNames[d as keyof typeof stageNames])

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "currentColor")

    // Style axes
    g.selectAll(".domain, .tick line")
      .attr("stroke", "currentColor")
      .attr("opacity", 0.2)

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Dream Stage Timeline")

  }, [segments, width, height])

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
        className="absolute pointer-events-none rounded-lg border bg-popover p-2 shadow-md text-popover-foreground text-xs"
        style={{ visibility: "hidden" }}
      />
    </div>
  )
}
