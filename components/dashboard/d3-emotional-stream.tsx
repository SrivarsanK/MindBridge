"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

export interface EmotionTimePoint {
  date: Date
  emotions: Record<string, number>
}

interface D3EmotionalStreamGraphProps {
  data: EmotionTimePoint[]
  width?: number
  height?: number
  className?: string
}

const emotionColors: Record<string, string> = {
  happy: "#10b981",
  fear: "#ef4444",
  anxiety: "#f59e0b",
  calm: "#3b82f6",
  sad: "#6366f1",
  love: "#ec4899",
  excited: "#fbbf24",
  anger: "#dc2626",
}

export function D3EmotionalStreamGraph({
  data,
  width = 800,
  height = 300,
  className = ""
}: D3EmotionalStreamGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    const tooltip = d3.select(tooltipRef.current)
    
    // Clear previous content
    svg.selectAll("*").remove()

    // Margins
    const margin = { top: 40, right: 120, bottom: 50, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create main group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Get all emotion keys
    const emotionKeys = data.length > 0 ? Object.keys(data[0].emotions) : []

    // Transform data for stacking
    const stackData = data.map(d => {
      const obj: any = { date: d.date }
      emotionKeys.forEach(key => {
        obj[key] = d.emotions[key] || 0
      })
      return obj
    })

    // Create stack
    const stack = d3.stack()
      .keys(emotionKeys)
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderInsideOut)

    const series = stack(stackData)

    // X scale (time)
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, innerWidth])

    // Y scale
    const yMin = d3.min(series, s => d3.min(s, d => d[0])) || 0
    const yMax = d3.max(series, s => d3.max(s, d => d[1])) || 1

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0])

    // Area generator
    const area = d3.area<any>()
      .x(d => xScale(d.data.date))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveBasis)

    // Add gradient definitions
    const defs = svg.append("defs")
    
    emotionKeys.forEach((emotion, i) => {
      const color = emotionColors[emotion] || d3.schemeCategory10[i % 10]
      const gradient = defs
        .append("linearGradient")
        .attr("id", `stream-gradient-${emotion}`)
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%")

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.8)

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color)
        .attr("stop-opacity", 0.3)
    })

    // Draw streams
    const streams = g
      .selectAll(".stream")
      .data(series)
      .enter()
      .append("g")
      .attr("class", "stream")

    streams
      .append("path")
      .attr("d", area)
      .attr("fill", (d, i) => `url(#stream-gradient-${d.key})`)
      .attr("stroke", (d, i) => emotionColors[d.key as string] || d3.schemeCategory10[i % 10])
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke-width", 2)
          .attr("opacity", 1)

        // Dim other streams
        streams.selectAll("path")
          .filter(s => s !== d)
          .transition()
          .duration(200)
          .attr("opacity", 0.3)

        tooltip
          .style("visibility", "visible")
          .html(`
            <div class="font-medium capitalize">${d.key}</div>
            <div class="text-xs">Emotional stream over time</div>
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
      })
      .on("mouseout", function() {
        streams.selectAll("path")
          .transition()
          .duration(200)
          .attr("stroke-width", 0.5)
          .attr("opacity", 1)

        tooltip.style("visibility", "hidden")
      })

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d => d3.timeFormat("%b %d")(d as Date))

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "currentColor")

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - margin.right + 10},${margin.top})`)

    emotionKeys.forEach((emotion, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0,${i * 20})`)
        .style("cursor", "pointer")
        .on("click", function() {
          // Toggle stream visibility
          const stream = streams.filter(d => d.key === emotion)
          const path = stream.select("path")
          const isVisible = path.attr("opacity") !== "0"
          
          path.transition()
            .duration(300)
            .attr("opacity", isVisible ? 0 : 1)

          d3.select(this)
            .select("rect")
            .transition()
            .duration(300)
            .attr("opacity", isVisible ? 0.3 : 1)
        })

      legendRow
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", emotionColors[emotion] || d3.schemeCategory10[i % 10])
        .attr("rx", 2)

      legendRow
        .append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .style("font-size", "11px")
        .text(emotion.charAt(0).toUpperCase() + emotion.slice(1))
    })

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
      .text("Emotional Flow Over Time")

    // Animate entrance
    streams.select("path")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("opacity", 1)

  }, [data, width, height])

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
