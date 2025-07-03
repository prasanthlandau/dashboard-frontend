'use client';
import React, { useState } from 'react';
import { 
  Avatar, Button, ClickAwayListener, Grow, Paper, Popper, 
  MenuItem, MenuList, SvgIcon, Select, Stack, Typography 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { SvgIconProps } from '@mui/material/SvgIcon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

interface HeaderProps {
  onRefresh: (curriculumId?: string) => Promise<void>;
  isLoading?: boolean; // Add loading state prop
}

const Header = ({ onRefresh, isLoading = false }: HeaderProps) => {
  const router = useRouter();
  const [provider, setProvider] = useState('Default');
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const baseDate = '2024-08-25 00:00:00';

  function HomeIcon(props: SvgIconProps) {
    return (
      <SvgIcon {...props}>
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </SvgIcon>
    );
  }

  const handleProviderChange = async (event) => {
  const newProvider = event.target.value;
  setProvider(newProvider);
  
  let curriculumId;
  switch(newProvider) {
    case 'BP':
      curriculumId = '2';
      break;
    case 'MoSE':
      curriculumId = '1';
      break;
    default:
      curriculumId = undefined;
  }
  
  await onRefresh(curriculumId);
};

    const handleRefresh = async () => {
    try {
      let curriculumId;
      switch(provider) {
        case 'BP':
          curriculumId = '2';
          break;
        case 'MoSE':
          curriculumId = '1';
          break;
        default:
          curriculumId = undefined;
      }

      if (onRefresh) {
        await onRefresh(curriculumId);
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  return (
    <div className="flex flex-row-reverse justify-between w-full items-center z-50 relative p-4">
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" color="textSecondary">
          Data from : {dayjs(baseDate).format('DD-MM-YYYY')} to {dayjs().format('DD-MM-YYYY')}
        </Typography>

        <Select
          value={provider}
          onChange={handleProviderChange}
          sx={{ 
            minWidth: 120,
            height: 40,
            borderRadius: '20px',
            backgroundColor: 'white',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
        >
          <MenuItem value="Default">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100"></div>
              Default
            </div>
          </MenuItem>
          <MenuItem value="BP">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100"></div>
              BP
            </div>
          </MenuItem>
          <MenuItem value="MoSE">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100"></div>
              MoSE
            </div>
          </MenuItem>
        </Select>

        <Button
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
          variant="outlined"
          sx={{ 
            color: '#0066cc',
            borderColor: '#0066cc',
            borderRadius: '4px',
            textTransform: 'none'
          }}
        >
          Refresh
        </Button>

        <Button
          ref={anchorRef}
          onClick={handleToggle}
          sx={{ padding: 0, minWidth: 'auto' }}
        >
          <Avatar sx={{ bgcolor: '#0066cc' }}>LL</Avatar>
        </Button>

        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-end"
          transition
          disablePortal
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList>
                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={handleClose}>Logout</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </Stack>

      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="flex items-center text-blue-600">
            <HomeIcon fontSize="small" />
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/" className="text-gray-600">
            Executive Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
