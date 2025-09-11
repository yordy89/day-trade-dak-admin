'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import {
  Save,
  Visibility,
  Code,
  MoreVert,
  Fullscreen,
  Download,
  Upload,
} from '@mui/icons-material'
import { api } from '@/lib/api-client'
import { toast } from 'react-hot-toast'

// Dynamically import EmailEditor to avoid SSR issues
const EmailEditor = dynamic(() => import('react-email-editor'), { ssr: false })

interface EmailEditorComponentProps {
  value?: string
  jsonContent?: any
  onChange?: (html: string, json: any) => void
  onSave?: (html: string, json: any) => void
  showActions?: boolean
  height?: string
}

export function EmailEditorComponent({
  value,
  jsonContent,
  onChange,
  onSave,
  showActions = true,
  height = '600px',
}: EmailEditorComponentProps) {
  const emailEditorRef = useRef<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [saveTemplateDialog, setSaveTemplateDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateCategory, setTemplateCategory] = useState('custom')
  const [savingTemplate, setSavingTemplate] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load existing content when editor is ready
    const editor = emailEditorRef.current?.editor
    if (editor && jsonContent) {
      editor.loadDesign(jsonContent)
    }
  }, [jsonContent])

  useEffect(() => {
    // Cleanup timer and interval on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current)
      }
    }
  }, [])

  const triggerAutoSave = () => {
    if (!emailEditorRef.current) return
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    
    // Set new timer for auto-save (debounced to 1 second)
    autoSaveTimerRef.current = setTimeout(() => {
      emailEditorRef.current.exportHtml((data: any) => {
        const { design, html } = data
        if (onChange) {
          onChange(html, design)
        }
      })
    }, 1000)
  }

  const onReady = () => {
    console.log('Email editor ready')
    const editor = emailEditorRef.current?.editor
    
    if (!editor) {
      console.error('Email editor ref not available')
      return
    }
    
    // Load existing content or default template
    if (jsonContent) {
      console.log('Loading existing design')
      editor.loadDesign(jsonContent)
    } else {
      console.log('Loading default template')
      const defaultDesign = {
        body: {
          rows: [],
          values: {
            backgroundColor: '#ffffff',
            contentWidth: '600px',
            fontFamily: {
              label: 'Arial',
              value: "'Arial', sans-serif"
            }
          }
        }
      }
      editor.loadDesign(defaultDesign)
    }
    
    // Initial save after loading
    setTimeout(() => {
      const editorInstance = emailEditorRef.current?.editor
      if (editorInstance) {
        console.log('Initial auto-save')
        editorInstance.exportHtml((data: any) => {
          const { design, html } = data
          console.log('Initial save - HTML length:', html?.length || 0)
          if (onChange) {
            onChange(html || '', design || {})
          }
        })
      }
    }, 1000)
    
    // Set up auto-save interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current)
    }
    
    autoSaveIntervalRef.current = setInterval(() => {
      const editorInstance = emailEditorRef.current?.editor
      if (editorInstance) {
        editorInstance.exportHtml((data: any) => {
          const { design, html } = data
          console.log('Auto-saving - HTML length:', html?.length || 0)
          if (onChange) {
            onChange(html || '', design || {})
          }
        })
      }
    }, 3000) // Auto-save every 3 seconds
  }

  const exportHtml = () => {
    console.log('Save Template clicked')
    const editor = emailEditorRef.current?.editor
    if (!editor) {
      console.error('Email editor ref not available for save')
      return
    }

    // First ensure the content is saved to the campaign state
    editor.exportHtml((data: any) => {
      const { design, html } = data
      console.log('Exporting HTML - length:', html?.length || 0)
      
      if (onChange) {
        console.log('Calling onChange with HTML')
        onChange(html || '', design || {})
      }
      if (onSave) {
        console.log('Calling onSave with HTML')
        onSave(html || '', design || {})
      }
    })
    
    // Open the save template dialog
    setSaveTemplateDialog(true)
  }
  
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }
    
    const editor = emailEditorRef.current?.editor
    if (!editor) {
      toast.error('Email editor not ready')
      return
    }
    
    setSavingTemplate(true)
    
    try {
      // Export the current design
      editor.exportHtml(async (data: any) => {
        const { design, html } = data
        
        if (!html) {
          toast.error('No template content to save')
          setSavingTemplate(false)
          return
        }
        
        // Save template to API
        const templateData = {
          name: templateName,
          description: templateDescription,
          category: templateCategory,
          htmlContent: html,
          jsonConfig: design,
          isPublic: false,
        }
        
        console.log('Saving template to API:', templateData)
        
        try {
          const response = await api.post('/email-marketing/templates', templateData)
          console.log('Template saved:', response.data)
          toast.success('Template saved successfully!')
          
          // Reset dialog
          setSaveTemplateDialog(false)
          setTemplateName('')
          setTemplateDescription('')
          setTemplateCategory('custom')
        } catch (error: any) {
          console.error('Error saving template:', error)
          toast.error(error.response?.data?.message || 'Failed to save template')
        } finally {
          setSavingTemplate(false)
        }
      })
    } catch (error) {
      console.error('Error exporting template:', error)
      toast.error('Failed to export template')
      setSavingTemplate(false)
    }
  }

  const handlePreview = () => {
    const editor = emailEditorRef.current?.editor
    if (!editor) return

    editor.exportHtml((data: any) => {
      const { html } = data
      const previewWindow = window.open('', '_blank')
      if (previewWindow) {
        previewWindow.document.write(html)
        previewWindow.document.close()
      }
    })
  }

  const handleExportHtml = () => {
    const editor = emailEditorRef.current?.editor
    if (!editor) return

    editor.exportHtml((data: any) => {
      const { html } = data
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'email-template.html'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const handleExportJson = () => {
    const editor = emailEditorRef.current?.editor
    if (!editor) return

    editor.exportHtml((data: any) => {
      const { design } = data
      const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'email-template.json'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  const handleImportJson = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event: any) => {
          try {
            const design = JSON.parse(event.target.result)
            const editor = emailEditorRef.current?.editor
            if (editor) {
              editor.loadDesign(design)
            }
          } catch (error) {
            console.error('Error parsing JSON:', error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Paper
      sx={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {showActions && (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            borderBottom={1}
            borderColor="divider"
          >
            <Typography variant="h6">Email Template Editor</Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={handlePreview}
                size="small"
              >
                Preview
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={exportHtml}
                size="small"
              >
                Save Template
              </Button>
              <IconButton onClick={toggleFullscreen} size="small">
                <Fullscreen />
              </IconButton>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="small"
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={handleExportHtml}>
              <Download sx={{ mr: 1 }} fontSize="small" />
              Export as HTML
            </MenuItem>
            <MenuItem onClick={handleExportJson}>
              <Code sx={{ mr: 1 }} fontSize="small" />
              Export as JSON
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleImportJson}>
              <Upload sx={{ mr: 1 }} fontSize="small" />
              Import JSON Template
            </MenuItem>
          </Menu>
        </>
      )}

      <Box sx={{ flex: 1, height: isFullscreen ? 'calc(100vh - 80px)' : height }}>
        <EmailEditor
          ref={emailEditorRef}
          onReady={onReady}
          options={{
            appearance: {
              theme: 'modern_light',
            },
            features: {
              colorPicker: {
                presets: ['#16a34a', '#15803d', '#22c55e', '#4ade80', '#86efac'],
              },
            },
            tools: {
              form: {
                enabled: false,
              },
            },
            mergeTags: {
              firstName: {
                name: 'First Name',
                value: '{{firstName}}',
                sample: 'John',
              },
              lastName: {
                name: 'Last Name',
                value: '{{lastName}}',
                sample: 'Doe',
              },
              email: {
                name: 'Email',
                value: '{{email}}',
                sample: 'john@example.com',
              },
              subscriptionPlan: {
                name: 'Subscription',
                value: '{{subscriptionPlan}}',
                sample: 'Premium',
              },
            },
            displayMode: 'email',
          }}
        />
      </Box>

      {!showActions && (
        <Alert severity="info" sx={{ m: 2 }}>
          Use the toolbar above to design your email template. Your changes are automatically saved.
        </Alert>
      )}
      
      {/* Save Template Dialog */}
      <Dialog 
        open={saveTemplateDialog} 
        onClose={() => setSaveTemplateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save Email Template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            variant="outlined"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Category</InputLabel>
            <Select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="newsletter">Newsletter</MenuItem>
              <MenuItem value="promotional">Promotional</MenuItem>
              <MenuItem value="announcement">Announcement</MenuItem>
              <MenuItem value="event">Event</MenuItem>
              <MenuItem value="educational">Educational</MenuItem>
              <MenuItem value="transactional">Transactional</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveTemplateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveTemplate} 
            variant="contained"
            disabled={savingTemplate || !templateName.trim()}
          >
            {savingTemplate ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}