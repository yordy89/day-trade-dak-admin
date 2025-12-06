import { Box, Typography } from '@mui/material'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 4,
      }}
    >
      <Box>
        {typeof title === 'string' ? (
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {title}
          </Typography>
        ) : (
          title
        )}
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  )
}