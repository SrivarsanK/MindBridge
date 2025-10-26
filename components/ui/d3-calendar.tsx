"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { cn } from "@/lib/utils"

interface D3CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function D3Calendar({
  selected,
  onSelect,
  disabled,
  className,
  minDate,
  maxDate,
}: D3CalendarProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [currentMonth, setCurrentMonth] = useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )
  const [isDark, setIsDark] = useState(false)
  
  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 320
    const height = 310
    const cellSize = 40
    const padding = 5

    svg.attr("viewBox", `0 0 ${width} ${height}`)

    // Get month data
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    // Header with month and year
    const headerGroup = svg.append("g").attr("class", "header")

    headerGroup
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "16")
      .attr("font-weight", "600")
      .attr("fill", "currentColor")
      .text(
        firstDay.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      )

    // Navigation buttons
    const buttonGroup = svg.append("g").attr("class", "navigation")

    // Previous month button
    const prevButton = buttonGroup
      .append("g")
      .attr("class", "prev-button cursor-pointer")
      .attr("transform", `translate(20, 15)`)
      .style("opacity", 0.7)
      .on("mouseover", function () {
        d3.select(this).style("opacity", 1)
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 0.7)
      })
      .on("click", () => {
        setCurrentMonth(new Date(year, month - 1, 1))
      })

    prevButton
      .append("rect")
      .attr("x", -15)
      .attr("y", -10)
      .attr("width", 30)
      .attr("height", 20)
      .attr("rx", 4)
      .attr("class", "fill-transparent")

    prevButton
      .append("path")
      .attr("d", "M 5 0 L -5 0 L 0 -5 Z")
      .attr("transform", "rotate(90)")
      .attr("fill", "currentColor")

    // Next month button
    const nextButton = buttonGroup
      .append("g")
      .attr("class", "next-button cursor-pointer")
      .attr("transform", `translate(${width - 20}, 15)`)
      .style("opacity", 0.7)
      .on("mouseover", function () {
        d3.select(this).style("opacity", 1)
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 0.7)
      })
      .on("click", () => {
        setCurrentMonth(new Date(year, month + 1, 1))
      })

    nextButton
      .append("rect")
      .attr("x", -15)
      .attr("y", -10)
      .attr("width", 30)
      .attr("height", 20)
      .attr("rx", 4)
      .attr("class", "fill-transparent")

    nextButton
      .append("path")
      .attr("d", "M -5 0 L 5 0 L 0 5 Z")
      .attr("transform", "rotate(90)")
      .attr("fill", "currentColor")

    // Days of week header
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    const dayHeaderGroup = svg.append("g").attr("class", "day-headers")

    daysOfWeek.forEach((day, i) => {
      dayHeaderGroup
        .append("text")
        .attr("x", 20 + i * cellSize + cellSize / 2)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .attr("font-size", "12")
        .attr("font-weight", "500")
        .attr("fill", "#9ca3af")
        .text(day)
    })

    // Calendar grid
    const calendarGroup = svg.append("g").attr("class", "calendar-grid")

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Create cells for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()
      const weekOfMonth = Math.floor((day + startingDayOfWeek - 1) / 7)

      const x = 20 + dayOfWeek * cellSize
      const y = 70 + weekOfMonth * cellSize

      const isSelected =
        selected &&
        date.getDate() === selected.getDate() &&
        date.getMonth() === selected.getMonth() &&
        date.getFullYear() === selected.getFullYear()

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

      const isPast = date < today && !isToday
      const isDisabled = disabled ? disabled(date) : false

      const cellGroup = calendarGroup
        .append("g")
        .attr("class", `day-cell ${isDisabled ? "disabled" : ""}`)
        .attr("transform", `translate(${x}, ${y})`)

      // Cell background
      const rect = cellGroup
        .append("rect")
        .attr("width", cellSize - padding)
        .attr("height", cellSize - padding)
        .attr("rx", 8)
        .attr("class", () => {
          if (isDisabled) {
            return "cursor-not-allowed"
          } else if (isSelected) {
            return "cursor-pointer"
          } else if (isToday) {
            return "cursor-pointer"
          } else {
            return "cursor-pointer transition-all"
          }
        })
        .style("fill", () => {
          if (isSelected) {
            return "#14b8a6" // Teal color for selected
          } else if (isToday) {
            return "hsl(var(--accent))" // Accent for today
          } else {
            return "transparent" // No fill for all other dates
          }
        })
        .style("stroke", isSelected ? "none" : isToday ? "#14b8a6" : "none")
        .style("stroke-width", 2)

      // Add hover effect
      if (!isDisabled) {
        cellGroup
          .on("mouseover", function () {
            if (!isSelected) {
              d3.select(this)
                .select("rect")
                .transition()
                .duration(150)
                .style("fill", "hsl(var(--accent) / 0.5)")
            }
          })
          .on("mouseout", function () {
            if (!isSelected) {
              d3.select(this)
                .select("rect")
                .transition()
                .duration(150)
                .style("fill", isToday ? "hsl(var(--accent))" : "transparent")
            }
          })
          .on("click", () => {
            onSelect?.(date)
          })
      }

      // Day number
      const textElement = cellGroup
        .append("text")
        .attr("x", (cellSize - padding) / 2)
        .attr("y", (cellSize - padding) / 2 + 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "14")
        .attr("pointer-events", "none")
        .attr("class", "calendar-day-text")
        .text(day)
      
      // Apply font weight
      if (isSelected || isToday) {
        textElement.attr("font-weight", "600")
      }
      
      // Set text color based on theme and selection
      if (isSelected) {
        textElement.attr("fill", "#ffffff")
      } else if (isDisabled || isPast) {
        textElement.attr("fill", "#6b7280") // Darker grey text for disabled/past dates
      } else {
        textElement.attr("fill", isDark ? "#ffffff" : "#000000")
      }

      // Selected indicator dot
      if (isSelected) {
        cellGroup
          .append("circle")
          .attr("cx", (cellSize - padding) / 2)
          .attr("cy", (cellSize - padding) - 5)
          .attr("r", 2)
          .attr("fill", "#ffffff")
          .attr("pointer-events", "none")
      }
    }
  }, [currentMonth, selected, disabled, onSelect, isDark])

  return (
    <div className={cn("w-full max-w-[320px] mx-auto", className)}>
      <svg
        ref={svgRef}
        className="w-full h-auto"
        style={{ maxWidth: "320px" }}
      />
    </div>
  )
}
