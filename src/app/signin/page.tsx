"use client";

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from "next/link"
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"

export default function SignInSide() {
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const router = useRouter();

    const formSchema = z.object({
        email: z.string().email({
            message: "Invalid email address",
        }),
        password: z.string().min(8, {
            message: "Password must be at least 8 characters long",
        }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setError(null);
            setLoading(true);
            await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
            }).then((response: any) => {
                const { error, ok } = response;
                if (ok) {
                    router.push("/");
                } else {
                    setError(error);
                    setLoading(false);
                }
            });
        } catch (error: Error | any) {
            setError(error.message);
        }
    };

    function Copyright(props: any) {
        return (
            <Typography variant="body2" color="text.secondary" align="center" {...props}>
                {"Copyright "}&copy; {' '}
                <Link color="inherit" href="/">
                    Factory
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
        );
    }

    return (
        <Grid container component="main" sx={{ height: '100vh' }}>
            <CssBaseline />
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1600009723489-027195d6b3d3)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    {error && (
                        <Typography variant="body2" color="error">
                            {error}
                        </Typography>
                    )
                    }
                    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            autoFocus
                            {...form.register("email")}
                            error={Boolean(form.formState.errors.email)}
                            helperText={form.formState.errors.email?.message}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            type="password"
                            id="password"
                            {...form.register("password")}
                            error={Boolean(form.formState.errors.password)}
                            helperText={form.formState.errors.password?.message}
                            disabled={loading}
                        />
                        {/*
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            Sign In
                        </Button>
                        
                        <Grid container>
                            {/*
                            <Grid item xs>
                                <Link href="#" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            */}
                            <Grid item>
                                <Link href="/signup">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                        
                        <Copyright sx={{ mt: 5 }} />
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
}