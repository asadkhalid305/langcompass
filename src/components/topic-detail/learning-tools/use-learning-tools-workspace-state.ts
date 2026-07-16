"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  DEFAULT_LEARNING_TOOL_OPTIONS,
  GERMAN_TRANSLATION_SOURCE_LANGUAGE,
  readWorkspace,
  TRANSLATION_TARGET_LANGUAGES,
  writeWorkspace,
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
  const [workspaceRestored, setWorkspaceRestored] = useState(false)
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

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (!active) return
      const workspace = readWorkspace(window.sessionStorage)
      if (workspace?.topicId === context.topicId) {
        const restoredTargetLanguage = TRANSLATION_TARGET_LANGUAGES.some(
          (language) => language.code === workspace.options.targetLanguage,
        )
          ? workspace.options.targetLanguage
          : "en"
        setTool(workspace.tool)
        setSource(workspace.source)
        setLearnerText(workspace.learnerText)
        setTaskOptions({
          ...workspace.options,
          sourceLanguage: GERMAN_TRANSLATION_SOURCE_LANGUAGE,
          targetLanguage: restoredTargetLanguage,
        })
      }
      setWorkspaceRestored(true)
    })
    return () => {
      active = false
    }
  }, [context.topicId])

  useEffect(() => {
    if (!workspaceRestored) return
    writeWorkspace(window.sessionStorage, {
      topicId: context.topicId,
      tool,
      source,
      learnerText,
      options: taskOptions,
    })
  }, [context.topicId, learnerText, source, taskOptions, tool, workspaceRestored])

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
    explainGeneratedExample,
    languagePairInvalid,
    learnerText,
    missingTranslationSource,
    open,
    openFromContext,
    requiresLessonDetail,
    resetSourceForTool,
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
