'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material'
import {
  Add,
  MoreVert,
  Edit,
  ContentCopy,
  Delete,
  Visibility,
  Code,
  Public,
  Lock,
  ArrowBack,
} from '@mui/icons-material'
import { AdminLayout } from '@/components/layout/admin-layout'
import { EmailEditorComponent } from '@/components/email-marketing/email-editor'
import { api } from '@/lib/api-client'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface Template {
  _id: string
  name: string
  description?: string
  category: string
  thumbnail?: string
  htmlContent: string
  jsonConfig?: any
  isPublic: boolean
  isActive: boolean
  createdBy: {
    firstName: string
    lastName: string
    email: string
  }
  usageCount: number
  lastUsed?: string
  createdAt: string
  tags?: string[]
}

const categories = [
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'event', label: 'Event' },
  { value: 'educational', label: 'Educational' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'custom', label: 'Custom' },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [defaultTemplates, setDefaultTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editorDialogOpen, setEditorDialogOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [filters, setFilters] = useState({
    category: 'all',
    isPublic: 'all',
  })

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom',
    isPublic: false,
  })

  useEffect(() => {
    fetchTemplates()
    fetchDefaultTemplates()
  }, [filters])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.isPublic !== 'all' && { isPublic: filters.isPublic }),
      })

      const response = await api.get(`/email-marketing/templates?${params}`)
      setTemplates(response.data.templates)
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const fetchDefaultTemplates = async () => {
    try {
      const response = await api.get('/email-marketing/templates/default')
      setDefaultTemplates(response.data)
    } catch (error) {
      console.error('Error fetching default templates:', error)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: Template) => {
    setAnchorEl(event.currentTarget)
    setSelectedTemplate(template)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedTemplate(null)
  }

  const handleCreateTemplate = async () => {
    try {
      const response = await api.post('/email-marketing/templates', {
        ...newTemplate,
        htmlContent: '<p>Start designing your template...</p>',
      })
      toast.success('Template created successfully')
      setCreateDialogOpen(false)
      setNewTemplate({
        name: '',
        description: '',
        category: 'custom',
        isPublic: false,
      })
      fetchTemplates()
      // Open editor for new template
      setSelectedTemplate(response.data)
      setEditorDialogOpen(true)
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Failed to create template')
    }
  }

  const handleDuplicateTemplate = async () => {
    if (!selectedTemplate) return

    try {
      await api.post(`/email-marketing/templates/${selectedTemplate._id}/duplicate`)
      toast.success('Template duplicated successfully')
      handleMenuClose()
      fetchTemplates()
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast.error('Failed to duplicate template')
    }
  }

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return

    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      await api.delete(`/email-marketing/templates/${selectedTemplate._id}`)
      toast.success('Template deleted successfully')
      handleMenuClose()
      fetchTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleSaveTemplate = async (html: string, json: any) => {
    if (!selectedTemplate) return

    try {
      await api.patch(`/email-marketing/templates/${selectedTemplate._id}`, {
        htmlContent: html,
        jsonConfig: json,
      })
      toast.success('Template saved successfully')
      fetchTemplates()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    }
  }

  const handleUseDefaultTemplate = async (defaultTemplate: any) => {
    try {
      const response = await api.post('/email-marketing/templates', {
        name: `${defaultTemplate.name} - Copy`,
        description: defaultTemplate.description,
        category: defaultTemplate.category,
        htmlContent: defaultTemplate.htmlContent,
        isPublic: false,
      })
      toast.success('Template created from default')
      fetchTemplates()
      setCurrentTab(0)
    } catch (error) {
      console.error('Error using default template:', error)
      toast.error('Failed to create template')
    }
  }

  const renderTemplateCard = (template: any, isDefault = false) => (
    <Grid item xs={12} md={6} lg={4} key={template._id || template.id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {template.thumbnail && (
          <CardMedia
            component="img"
            height="200"
            image={template.thumbnail}
            alt={template.name}
          />
        )}
        <CardContent sx={{ flex: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" component="div">
              {template.name}
            </Typography>
            {!isDefault && (
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, template)}
              >
                <MoreVert />
              </IconButton>
            )}
          </Box>
          {template.description && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              {template.description}
            </Typography>
          )}
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip
              label={categories.find(c => c.value === template.category)?.label || template.category}
              size="small"
              variant="outlined"
            />
            {!isDefault && (
              <>
                <Chip
                  icon={template.isPublic ? <Public /> : <Lock />}
                  label={template.isPublic ? 'Public' : 'Private'}
                  size="small"
                  variant="outlined"
                />
                {template.usageCount > 0 && (
                  <Chip
                    label={`Used ${template.usageCount} times`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </>
            )}
          </Box>
          {!isDefault && template.createdBy && (
            <Typography variant="caption" color="text.secondary" display="block" mt={2}>
              Created by {template.createdBy.firstName} {template.createdBy.lastName}
              <br />
              {format(new Date(template.createdAt), 'MMM dd, yyyy')}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          {isDefault ? (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleUseDefaultTemplate(template)}
            >
              Use This Template
            </Button>
          ) : (
            <>
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={() => {
                  setSelectedTemplate(template)
                  setEditorDialogOpen(true)
                }}
              >
                Edit
              </Button>
              <Button
                size="small"
                startIcon={<Visibility />}
                onClick={() => {
                  const previewWindow = window.open('', '_blank')
                  if (previewWindow) {
                    previewWindow.document.write(template.htmlContent)
                    previewWindow.document.close()
                  }
                }}
              >
                Preview
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    </Grid>
  )

  return (
    <AdminLayout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => router.push('/email-marketing')}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Email Templates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage reusable email templates
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Template
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
          <Tab label="My Templates" />
          <Tab label="Default Templates" />
        </Tabs>

        {/* Filters (for My Templates) */}
        {currentTab === 0 && (
          <Box display="flex" gap={2} mb={3}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={filters.isPublic}
                onChange={(e) => setFilters({ ...filters, isPublic: e.target.value })}
                label="Visibility"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="true">Public</MenuItem>
                <MenuItem value="false">Private</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Templates Grid */}
        <Grid container spacing={3}>
          {loading ? (
            <Grid item xs={12} display="flex" justifyContent="center">
              <CircularProgress />
            </Grid>
          ) : currentTab === 0 ? (
            templates.length > 0 ? (
              templates.map((template) => renderTemplateCard(template))
            ) : (
              <Grid item xs={12}>
                <Typography color="text.secondary" align="center">
                  No templates found. Create your first template to get started.
                </Typography>
              </Grid>
            )
          ) : (
            defaultTemplates.map((template) => renderTemplateCard(template, true))
          )}
        </Grid>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              setEditorDialogOpen(true)
              handleMenuClose()
            }}
          >
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDuplicateTemplate}>
            <ContentCopy sx={{ mr: 1 }} fontSize="small" />
            Duplicate
          </MenuItem>
          <MenuItem onClick={handleDeleteTemplate} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>

        {/* Create Template Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template Name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Visibility</InputLabel>
                  <Select
                    value={newTemplate.isPublic}
                    onChange={(e) => setNewTemplate({ ...newTemplate, isPublic: e.target.value === 'true' })}
                    label="Visibility"
                  >
                    <MenuItem value="false">Private</MenuItem>
                    <MenuItem value="true">Public</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateTemplate}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Template Editor Dialog */}
        <Dialog
          open={editorDialogOpen}
          onClose={() => setEditorDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: '90vh' }
          }}
        >
          <DialogTitle>
            Edit Template: {selectedTemplate?.name}
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {selectedTemplate && (
              <EmailEditorComponent
                value={selectedTemplate.htmlContent}
                jsonContent={selectedTemplate.jsonConfig}
                onSave={handleSaveTemplate}
                height="calc(90vh - 140px)"
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditorDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  )
}