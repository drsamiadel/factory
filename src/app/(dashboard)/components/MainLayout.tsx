"use client"

import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { usePathname, useRouter } from 'next/navigation';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import InputRoundedIcon from '@mui/icons-material/InputRounded';
import Image from 'next/image';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { signOut } from "next-auth/react";
import { AppContextProps, SiteContext } from '@/hooks/site-context';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const routes = [
    {
        path: '/',
        icon: <DashboardRoundedIcon />,
        text: 'Dashboard',
    },
    {
        path: '/pricing',
        icon: <ReceiptLongRoundedIcon />,
        text: 'Pricing',
    },
    {
        path: '/suppliers',
        icon: <LocalShippingRoundedIcon />,
        text: 'Suppliers',
    },
    {
        path: "/customers",
        icon: <Groups2RoundedIcon />,
        text: 'Customers',
    },
    {
        path: "/delegates",
        icon: <PeopleRoundedIcon />,
        text: "Delegates"
    },
    {
        path: "/materials",
        icon: <Inventory2RoundedIcon />,
        text: 'Materials',
    },
    {
        path: "/inputs",
        icon: <InputRoundedIcon />,
        text: 'Inputs',
    }
];

const userRoutes = [
    {
        path: "/settings",
        icon: <SettingsRoundedIcon />,
        text: 'Settings',
    },
]

export default function MainLayout({ children, user }: {
    children: React.ReactNode;
    user: {
        name: string;
        email: string;
        role: string;
        image: string;
    };
}) {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const pathname = usePathname();
    const router = useRouter();
    const isActive = (path: string) => {
        return (pathname === "/" && path === "/") ||
            pathname?.startsWith(`${path}/`) ||
            pathname === path;
    };

    const { site } = React.useContext(SiteContext) as AppContextProps;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open} sx={{ boxShadow: "none" }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        {site?.companyName}
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={open}>
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose} sx={{ color: "primary.contrastText" }}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider sx={{ backgroundColor: "action.hover" }} />
                <List sx={{ display: 'flex', flexDirection: 'column', height: "100%", gap: 0.5 }}>
                    {routes.map((route, index) => (
                        <ListItem key={route.text} disablePadding sx={{ display: 'block', px: 1 }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    bgcolor: isActive(route.path) ? "secondary.main" : "inherit",
                                    color: isActive(route.path) ? "primary.main" : "inherit",
                                    '&:hover': {
                                        bgcolor: isActive(route.path) ? "secondary.main" : "action.hover",
                                    },
                                    borderRadius: theme.shape.borderRadius,
                                }}
                                onClick={() => router.push(route.path)}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: isActive(route.path) ? "primary.main" : "inherit",
                                    }}
                                >
                                    {route.icon}
                                </ListItemIcon>
                                <ListItemText primary={route.text} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <List sx={{ marginTop: "auto" }}>
                    <ListItem disablePadding sx={{ display: 'block', px: 1 }}>
                        <ListItemButton
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                borderRadius: theme.shape.borderRadius,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                    color: "primary.contrastText",
                                }}
                            >
                                {user.image ? (<Image src={user.image} alt={user.name} style={{ width: 24, height: 24, borderRadius: "50%" }} width={24} height={24} />) :
                                    <AccountCircleRoundedIcon />
                                }
                            </ListItemIcon>
                            <ListItemText primary={user.name} sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                    </ListItem>
                    {userRoutes.map((route, index) => (
                        <ListItem key={route.text} disablePadding sx={{ display: 'block', px: 1 }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                    borderRadius: theme.shape.borderRadius,
                                }}
                                onClick={() => router.push(route.path)}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: "primary.contrastText",
                                    }}
                                >
                                    {route.icon}
                                </ListItemIcon>
                                <ListItemText primary={route.text} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <ListItem disablePadding sx={{ display: 'block', px: 1 }}>
                        <ListItemButton
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                                borderRadius: theme.shape.borderRadius,
                            }}
                            onClick={() => signOut({ callbackUrl: "/signin" })}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                    color: "error.main",
                                }}
                            >
                                <LogoutRoundedIcon />
                            </ListItemIcon>
                            <ListItemText primary={"Logout"} sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                {children}
            </Box>
        </Box>
    );
}