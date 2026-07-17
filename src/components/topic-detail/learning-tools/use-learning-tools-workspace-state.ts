"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  DEFAULT_LEARNING_TOOL_OPTIONS,
  type LearningToolId,
  type LearningToolSource,
  type LearningToolsContext,
  type LearningToolTaskOptions,
} from "@/lib/learning-tools"

export interface LearningToolsOpenRequest {
  tool: LearningToolId
  source: LearningToolSource
}

export function useLearningToolsWorkspaceState(context: LearningToolsContext) {
  const defaultSource = useMemo<LearningToolSource>(
    () => ({ label: `${context.title} lesson`, text: context.summary || context.lessonText }),
    [context],
  )
  const [open, setOpen] = useState(false)
  const [desktop, setDesktop] = useState(false)
  const [tool, setTool] = useState<LearningToolId>("translate")
  const [source, setSource] = useState<LearningToolSource>(defaultSource)
  const [learnerText, setLearnerText] = useState("")
  const [taskOptions, setTaskOptions] = useState<LearningToolTaskOptions>(DEFAULT_LEARNING_TOOL_OPTIONS)
  const [sentenceFocusRequest, setSentenceFocusRequest] = useState(0)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const update = () => setDesktop(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  const openFromContext = useCallback(({ tool: nextTool, source: nextSource }: LearningToolsOpenRequest) => {
    setTool(nextTool)
    setSource(nextTool === "summarize"
      ? { label: `${context.title} full lesson`, text: context.lessonText }
      : nextSource)
    setOpen(true)
  }, [context.lessonText, context.title])

  const resetSourceForTool = useCallback((nextTool: LearningToolId) => {
    setTool(nextTool)
    setSource(nextTool === "summarize"
      ? { label: `${context.title} full lesson`, text: context.lessonText }
      : nextTool === "translate" && context.translationSources[0]
        ? context.translationSources[0]
        : defaultSource)
  }, [context.lessonText, context.title, context.translationSources, defaultSource])

  const selectTranslationSource = useCallback((index: number) => {
    const nextSource = context.translationSources[index]
    if (nextSource) setSource(nextSource)
  }, [context.translationSources])

  const updateTaskOption = useCallback(<Key extends keyof LearningToolTaskOptions>(
    key: Key,
    value: LearningToolTaskOptions[Key],
  ) => {
    setTaskOptions((current) => ({ ...current, [key]: value }))
  }, [])

  const tryAnotherSentence = useCallback(() => {
    setTool("check")
    setLearnerText("")
    setSentenceFocusRequest((request) => request + 1)
  }, [])

  const clearLearnerText = useCallback(() => setLearnerText(""), [])

  const resetWorkspace = useCallback(() => {
    setTool("translate")
    setSource(defaultSource)
    setLearnerText("")
    setTaskOptions(DEFAULT_LEARNING_TOOL_OPTIONS)
  }, [defaultSource])

  const explainGeneratedExample = useCallback((sourceText: string, index: number) => {
    setTool("explain")
    setSource({ label: `Generated example ${index + 1}`, text: sourceText })
  }, [])

  const translationSourceIndex = context.translationSources.findIndex((candidate) => candidate.text === source.text)
  const languagePairInvalid = tool === "translate" && taskOptions.sourceLanguage === taskOptions.targetLanguage
  const missingTranslationSource = tool === "translate" && context.translationSources.length === 0
  const requiresLessonDetail = !context.hasDetail && (tool === "summarize" || tool === "examples")

  return {
    defaultSource,
    desktop,
    clearLearnerText,
    explainGeneratedExample,
    languagePairInvalid,
    learnerText,
    missingTranslationSource,
    open,
    openFromContext,
    requiresLessonDetail,
    resetSourceForTool,
    resetWorkspace,
    selectTranslationSource,
    sentenceFocusRequest,
    setLearnerText,
    setOpen,
    source,
    taskOptions,
    tool,
    translationSourceIndex,
    tryAnotherSentence,
    updateTaskOption,
  }
}
