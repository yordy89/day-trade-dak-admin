'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Palette,
  Code,
  Preview,
  ContentCopy,
  Check,
  Refresh,
  Save,
} from '@mui/icons-material';
import { SketchPicker } from 'react-color';
import Editor from '@monaco-editor/react';

interface AnnouncementTemplateBuilderProps {
  value: {
    template?: string;
    customStyles?: any;
    customHtml?: string;
    content?: string;
    title?: string;
    type?: string;
  };
  onChange: (value: any) => void;
}

const predefinedTemplates = {
  default: {
    name: 'Trading Default',
    description: 'Professional trading theme with market indicators',
    styles: {
      headerBg: 'linear-gradient(90deg, #0a0a0a 0%, #141414 100%)',
      headerText: '#ffffff',
      bodyBg: '#1a1a1a',
      bodyText: '#e0e0e0',
      buttonBg: '#16a34a',
      buttonText: '#ffffff',
      borderColor: '#16a34a',
      animation: 'slideIn',
    },
  },
  earnings: {
    name: 'Earnings Report',
    description: 'High-impact earnings announcement style',
    styles: {
      headerBg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      headerText: '#ffffff',
      bodyBg: '#fffbeb',
      bodyText: '#78350f',
      buttonBg: '#ef4444',
      buttonText: '#ffffff',
      borderColor: '#f59e0b',
      animation: 'pulse',
    },
  },
  fed: {
    name: 'Fed Meeting',
    description: 'Federal Reserve announcement style',
    styles: {
      headerBg: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
      headerText: '#ffffff',
      bodyBg: '#eff6ff',
      bodyText: '#1e3a8a',
      buttonBg: '#3730a3',
      buttonText: '#ffffff',
      borderColor: '#3b82f6',
      animation: 'fadeIn',
    },
  },
  webinar: {
    name: 'Live Webinar',
    description: 'Interactive webinar announcement',
    styles: {
      headerBg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      headerText: '#ffffff',
      bodyBg: '#ecfdf5',
      bodyText: '#064e3b',
      buttonBg: '#10b981',
      buttonText: '#ffffff',
      borderColor: '#34d399',
      animation: 'bounce',
    },
  },
  course: {
    name: 'Course Launch',
    description: 'Educational content announcement',
    styles: {
      headerBg: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      headerText: '#ffffff',
      bodyBg: '#faf5ff',
      bodyText: '#4c1d95',
      buttonBg: '#a855f7',
      buttonText: '#ffffff',
      borderColor: '#c084fc',
      animation: 'expand',
    },
  },
};

const animationOptions = [
  { value: 'none', label: 'No Animation' },
  { value: 'slideIn', label: 'Slide In' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'expand', label: 'Expand' },
];

export default function AnnouncementTemplateBuilder({
  value,
  onChange,
}: AnnouncementTemplateBuilderProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(value.template || 'default');
  const [customStyles, setCustomStyles] = useState(value.customStyles || predefinedTemplates.default.styles);
  const [customHtml, setCustomHtml] = useState(value.customHtml || '');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [useCustomHtml, setUseCustomHtml] = useState(false);

  useEffect(() => {
    onChange({
      ...value,
      template: selectedTemplate,
      customStyles,
      customHtml,
    });
  }, [selectedTemplate, customStyles, customHtml]);

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    setCustomStyles(predefinedTemplates[templateKey as keyof typeof predefinedTemplates].styles);
  };

  const handleStyleChange = (key: string, value: string) => {
    setCustomStyles((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCopyStyles = () => {
    navigator.clipboard.writeText(JSON.stringify(customStyles, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePreviewHtml = () => {
    if (useCustomHtml && customHtml) {
      return customHtml
        .replace('{{title}}', value.title || 'Announcement Title')
        .replace('{{content}}', value.content || 'Announcement content goes here...');
    }

    return `
      <div style="
        background: ${customStyles.bodyBg};
        border: 2px solid ${customStyles.borderColor};
        border-radius: 12px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: ${customStyles.headerBg};
          color: ${customStyles.headerText};
          padding: 16px 20px;
        ">
          <h3 style="margin: 0; font-size: 18px; font-weight: 700;">
            ${value.title || 'Announcement Title'}
          </h3>
        </div>
        <div style="
          padding: 20px;
          color: ${customStyles.bodyText};
        ">
          <p style="margin: 0 0 16px 0; line-height: 1.6;">
            ${value.content || 'Announcement content goes here...'}
          </p>
          <button style="
            background: ${customStyles.buttonBg};
            color: ${customStyles.buttonText};
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          ">
            Learn More
          </button>
        </div>
      </div>
    `;
  };

  const defaultHtmlTemplate = `<!-- Custom Announcement HTML Template -->
<!-- Available variables: {{title}}, {{content}} -->
<div class="announcement-wrapper">
  <style>
    .announcement-wrapper {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 24px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .announcement-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    .announcement-icon {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }
    .announcement-title {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
    }
    .announcement-content {
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 20px;
      opacity: 0.95;
    }
    .announcement-button {
      background: white;
      color: #764ba2;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .announcement-button:hover {
      transform: translateY(-2px);
    }
  </style>

  <div class="announcement-header">
    <div class="announcement-icon">📈</div>
    <h3 class="announcement-title">{{title}}</h3>
  </div>

  <div class="announcement-content">
    {{content}}
  </div>

  <button class="announcement-button">
    Take Action →
  </button>
</div>`;

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab icon={<Palette />} label="Templates" />
          <Tab icon={<Preview />} label="Style Editor" />
          <Tab icon={<Code />} label="Custom HTML" />
        </Tabs>
      </Paper>

      {/* Templates Tab */}
      {activeTab === 0 && (
        <Grid container spacing={2}>
          {Object.entries(predefinedTemplates).map(([key, template]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedTemplate === key ? '2px solid' : '1px solid',
                  borderColor: selectedTemplate === key ? 'primary.main' : 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleTemplateSelect(key)}
              >
                <CardContent>
                  <Box
                    sx={{
                      height: 60,
                      background: template.styles.headerBg,
                      borderRadius: 1,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: template.styles.headerText, fontWeight: 700 }}
                    >
                      {template.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                  {selectedTemplate === key && (
                    <Chip
                      label="Selected"
                      color="primary"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Style Editor Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="h6">Customize Styles</Typography>

              {Object.entries({
                headerBg: 'Header Background',
                headerText: 'Header Text Color',
                bodyBg: 'Body Background',
                bodyText: 'Body Text Color',
                buttonBg: 'Button Background',
                buttonText: 'Button Text Color',
                borderColor: 'Border Color',
              }).map(([key, label]) => (
                <Box key={key}>
                  <Typography variant="body2" gutterBottom>
                    {label}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      size="small"
                      value={customStyles[key] || ''}
                      onChange={(e) => handleStyleChange(key, e.target.value)}
                      placeholder="#000000 or gradient"
                    />
                    <IconButton
                      size="small"
                      onClick={() => setShowColorPicker(showColorPicker === key ? null : key)}
                      sx={{
                        backgroundColor: customStyles[key]?.startsWith('#')
                          ? customStyles[key]
                          : 'transparent',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Palette fontSize="small" />
                    </IconButton>
                  </Stack>
                  {showColorPicker === key && (
                    <Box sx={{ position: 'absolute', zIndex: 2, mt: 1 }}>
                      <Box
                        sx={{ position: 'fixed', inset: 0 }}
                        onClick={() => setShowColorPicker(null)}
                      />
                      <SketchPicker
                        color={customStyles[key] || '#000000'}
                        onChange={(color) => handleStyleChange(key, color.hex)}
                      />
                    </Box>
                  )}
                </Box>
              ))}

              <FormControl fullWidth size="small">
                <InputLabel>Animation</InputLabel>
                <Select
                  value={customStyles.animation || 'none'}
                  label="Animation"
                  onChange={(e) => handleStyleChange('animation', e.target.value)}
                >
                  {animationOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={copied ? <Check /> : <ContentCopy />}
                  onClick={handleCopyStyles}
                >
                  {copied ? 'Copied!' : 'Copy Styles'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => handleTemplateSelect('default')}
                >
                  Reset
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                minHeight: 300,
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: generatePreviewHtml() }} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Custom HTML Tab */}
      {activeTab === 2 && (
        <Box>
          <Stack spacing={2} sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useCustomHtml}
                  onChange={(e) => setUseCustomHtml(e.target.checked)}
                />
              }
              label="Use Custom HTML Template"
            />

            {useCustomHtml && (
              <Alert severity="info">
                Use <code>{'{{title}}'}</code> and <code>{'{{content}}'}</code> as placeholders
                for dynamic content. Include styles within the HTML.
              </Alert>
            )}
          </Stack>

          {useCustomHtml && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  HTML Editor
                </Typography>
                <Paper sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  <Editor
                    height="400px"
                    language="html"
                    theme="vs-dark"
                    value={customHtml || defaultHtmlTemplate}
                    onChange={(value) => setCustomHtml(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      wordWrap: 'on',
                      automaticLayout: true,
                    }}
                  />
                </Paper>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setCustomHtml(defaultHtmlTemplate)}
                >
                  Load Example Template
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Live Preview
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    minHeight: 400,
                    maxHeight: 400,
                    overflow: 'auto',
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: generatePreviewHtml() }} />
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}