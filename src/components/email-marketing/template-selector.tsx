'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material'
import {
  Search,
  Close,
  Email,
  CheckCircle,
  Preview,
} from '@mui/icons-material'
import { api } from '@/lib/api-client'
import { toast } from 'react-hot-toast'

interface Template {
  _id: string
  name: string
  description?: string
  category: string
  thumbnail?: string
  htmlContent: string
  jsonConfig?: any
  defaultValues?: {
    subject?: string
    previewText?: string
  }
  usageCount: number
  lastUsed?: string
  createdBy: {
    firstName: string
    lastName: string
  }
  createdAt: string
}

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (template: Template) => void
}

const categoryColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  newsletter: 'primary',
  promotional: 'secondary',
  announcement: 'info',
  event: 'warning',
  educational: 'success',
  transactional: 'default',
  custom: 'default',
}

export function TemplateSelector({ open, onClose, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (open) {
      fetchTemplates()
    }
  }, [open])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await api.get('/email-marketing/templates')
      setTemplates(response.data.templates || response.data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = 
      selectedCategory === 'all' || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)
  }

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate)
      onClose()
      toast.success(`Template "${selectedTemplate.name}" selected`)
    }
  }

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template)
    setPreviewOpen(true)
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Select Email Template</Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {/* Filters */}
          <Box mb={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="newsletter">Newsletter</MenuItem>
                    <MenuItem value="promotional">Promotional</MenuItem>
                    <MenuItem value="announcement">Announcement</MenuItem>
                    <MenuItem value="event">Event</MenuItem>
                    <MenuItem value="educational">Educational</MenuItem>
                    <MenuItem value="transactional">Transactional</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Templates Grid */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : filteredTemplates.length === 0 ? (
            <Alert severity="info">
              No templates found. Create your first template to reuse it in campaigns.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredTemplates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template._id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedTemplate?._id === template._id ? 2 : 1,
                      borderColor: selectedTemplate?._id === template._id 
                        ? 'primary.main' 
                        : 'divider',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    {template.thumbnail ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={template.thumbnail}
                        alt={template.name}
                      />
                    ) : (
                      <Box
                        height={200}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bgcolor="grey.100"
                      >
                        <Email sx={{ fontSize: 60, color: 'grey.400' }} />
                      </Box>
                    )}
                    
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" component="div" noWrap>
                          {template.name}
                        </Typography>
                        {selectedTemplate?._id === template._id && (
                          <CheckCircle color="primary" />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {template.description || 'No description'}
                      </Typography>
                      
                      <Box display="flex" gap={1} mb={1}>
                        <Chip
                          label={template.category}
                          size="small"
                          color={categoryColors[template.category] || 'default'}
                        />
                        {template.usageCount > 0 && (
                          <Chip
                            label={`Used ${template.usageCount} times`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          By {template.createdBy.firstName} {template.createdBy.lastName}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Preview />}
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreview(template)
                          }}
                        >
                          Preview
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSelection}
            disabled={!selectedTemplate}
            startIcon={<CheckCircle />}
          >
            Use This Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Preview: {selectedTemplate?.name}
            </Typography>
            <IconButton onClick={() => setPreviewOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTemplate?.defaultValues?.subject && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Default Subject:
              </Typography>
              <Typography>{selectedTemplate.defaultValues.subject}</Typography>
            </Box>
          )}
          {selectedTemplate?.defaultValues?.previewText && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Default Preview Text:
              </Typography>
              <Typography>{selectedTemplate.defaultValues.previewText}</Typography>
            </Box>
          )}
          <Box
            border={1}
            borderColor="divider"
            borderRadius={1}
            p={2}
            bgcolor="grey.50"
            sx={{
              '& img': { maxWidth: '100%', height: 'auto' },
            }}
            dangerouslySetInnerHTML={{
              __html: selectedTemplate?.htmlContent || '',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setPreviewOpen(false)
              handleConfirmSelection()
            }}
            disabled={!selectedTemplate}
          >
            Use This Template
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}