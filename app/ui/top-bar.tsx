'use client'

import { alpha, AppBar, Autocomplete, Avatar, Box, Container, IconButton, Menu, MenuItem, TextField, Toolbar, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function TopBar({ options }: { options: { label: string, value: string }[] }) {
    const settings = ['Profile', 'Account', 'Logout'];
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const router = useRouter();

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="static">
            <Container maxWidth="lg">
                <Toolbar>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        Super Investor
                    </Typography>
                    <Box sx={{ flexGrow: 1, mx: 2 }}>
                        <Autocomplete
                            options={options}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    const ticker = newValue.label.split(' ')[0];
                                    router.push(`/${ticker}`);
                                }
                            }}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Ticker or company name"
                                    InputLabelProps={{
                                        style: { color: 'white' }
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        style: { color: 'white' }
                                    }}
                                />
                            )}
                            noOptionsText="Type to search"
                            filterOptions={(options, state) => {
                                return state.inputValue ? options.filter(option =>
                                    option.label.toLowerCase().includes(state.inputValue.toLowerCase())
                                ) : [];
                            }}
                            sx={{
                                width: '100%',
                                backgroundColor: alpha('#fff', 0.15),
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'white',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white',
                                },
                                '& .MuiAutocomplete-popupIndicator': {
                                    color: 'white',
                                },
                                '& .MuiAutocomplete-clearIndicator': {
                                    color: 'white',
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ flexGrow: 0, ml: 2 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="Aldo Leka">AL</Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}