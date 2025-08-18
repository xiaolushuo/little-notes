// 本地存储管理工具

export interface Note {
  id: string
  content: string
  tags: string[]
  image?: string
  drawing?: string
  audio?: string
  transcription?: string
  expirationDate?: Date
  reminderTime?: Date
  reminderType?: 'popup' | 'badge'
  createdAt: Date
  updatedAt: Date
  isPinned?: boolean
  todos?: TodoItem[]
}

export interface TodoItem {
  id: string
  text: string
  completed: boolean
  indent: number
  children?: TodoItem[]
}

const STORAGE_KEY = 'little-notes'

// 获取所有笔记
export const getNotes = (): Note[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const notes = JSON.parse(stored)
    // 将日期字符串转换回Date对象
    return notes.map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
      expirationDate: note.expirationDate ? new Date(note.expirationDate) : undefined,
      reminderTime: note.reminderTime ? new Date(note.reminderTime) : undefined,
    }))
  } catch (error) {
    console.error('Error loading notes from storage:', error)
    return []
  }
}

// 保存笔记
export const saveNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot save note on server side')
  }
  
  const existingNotes = getNotes()
  const newNote: Note = {
    ...note,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  const updatedNotes = [newNote, ...existingNotes]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes))
  
  return newNote
}

// 更新笔记
export const updateNote = (id: string, updates: Partial<Note>): Note | null => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot update note on server side')
  }
  
  const existingNotes = getNotes()
  const noteIndex = existingNotes.findIndex(note => note.id === id)
  
  if (noteIndex === -1) return null
  
  const updatedNote = {
    ...existingNotes[noteIndex],
    ...updates,
    updatedAt: new Date(),
  }
  
  existingNotes[noteIndex] = updatedNote
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingNotes))
  
  return updatedNote
}

// 删除笔记
export const deleteNote = (id: string): boolean => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot delete note on server side')
  }
  
  const existingNotes = getNotes()
  const filteredNotes = existingNotes.filter(note => note.id !== id)
  
  if (filteredNotes.length === existingNotes.length) return false
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes))
  return true
}

// 切换置顶状态
export const togglePinNote = (id: string): Note | null => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot toggle pin on server side')
  }
  
  const existingNotes = getNotes()
  const noteIndex = existingNotes.findIndex(note => note.id === id)
  
  if (noteIndex === -1) {
    console.warn(`Note with id ${id} not found`)
    return null
  }
  
  const note = existingNotes[noteIndex]
  const updatedNote = {
    ...note,
    isPinned: !note.isPinned,
    updatedAt: new Date(),
  }
  
  // 重新排序：置顶的笔记排在前面
  existingNotes.splice(noteIndex, 1)
  if (updatedNote.isPinned) {
    existingNotes.unshift(updatedNote)
  } else {
    // 找到合适的非置顶位置插入
    const firstUnpinnedIndex = existingNotes.findIndex(note => !note.isPinned)
    if (firstUnpinnedIndex === -1) {
      existingNotes.push(updatedNote)
    } else {
      existingNotes.splice(firstUnpinnedIndex, 0, updatedNote)
    }
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingNotes))
  return updatedNote
}

// 批量删除笔记
export const deleteNotes = (ids: string[]): number => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot delete notes on server side')
  }
  
  const existingNotes = getNotes()
  const filteredNotes = existingNotes.filter(note => !ids.includes(note.id))
  const deletedCount = existingNotes.length - filteredNotes.length
  
  if (deletedCount > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes))
  }
  
  return deletedCount
}

// 搜索笔记
export const searchNotes = (query: string, tags?: string[]): Note[] => {
  const notes = getNotes()
  
  return notes.filter(note => {
    const matchesQuery = !query.trim() || 
      note.content.toLowerCase().includes(query.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    
    const matchesTags = !tags || tags.length === 0 || 
      tags.some(tag => note.tags.includes(tag))
    
    return matchesQuery && matchesTags
  })
}

// 获取所有标签
export const getAllTags = (): string[] => {
  const notes = getNotes()
  const tagSet = new Set<string>()
  
  notes.forEach(note => {
    note.tags.forEach(tag => tagSet.add(tag))
  })
  
  return Array.from(tagSet).sort()
}