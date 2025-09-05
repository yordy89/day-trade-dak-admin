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

  useEffect(() => {
    // Load existing content when editor is ready
    if (emailEditorRef.current && jsonContent) {
      emailEditorRef.current.loadDesign(jsonContent)
    }
  }, [jsonContent])

  const onReady = () => {
    // Editor is ready
    if (jsonContent && emailEditorRef.current) {
      emailEditorRef.current.loadDesign(jsonContent)
    }
  }

  const exportHtml = () => {
    if (!emailEditorRef.current) return

    emailEditorRef.current.exportHtml((data: any) => {
      const { design, html } = data
      if (onChange) {
        onChange(html, design)
      }
      if (onSave) {
        onSave(html, design)
      }
    })
  }

  const handlePreview = () => {
    if (!emailEditorRef.current) return

    emailEditorRef.current.exportHtml((data: any) => {
      const { html } = data
      const previewWindow = window.open('', '_blank')
      if (previewWindow) {
        previewWindow.document.write(html)
        previewWindow.document.close()
      }
    })
  }

  const handleExportHtml = () => {
    if (!emailEditorRef.current) return

    emailEditorRef.current.exportHtml((data: any) => {
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
    if (!emailEditorRef.current) return

    emailEditorRef.current.exportHtml((data: any) => {
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
            if (emailEditorRef.current) {
              emailEditorRef.current.loadDesign(design)
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
    </Paper>
  )
}