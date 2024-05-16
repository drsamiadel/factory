"use client"

import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { set } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import theme from '@/theme';
import { CREATE, UPDATE } from '@/actions/setting';

export default function Page() {
    const [input, setInput] = React.useState({
        id: "",
        companyName: '',
        logo: '',
        phone1: '',
        phone2: '',
        fax: '',
        CRNumber: '',
        VATNumber: '',
        email: '',
        address: '',
        location: '',
    });

    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState([]);

    React.useEffect(() => {
        const fetchInfo = async () => {
            setLoading(true);
            const response = await fetch("/api/data/site");
            if (response.ok) {
                const data = await response.json();
                if (data.siteInfo !== null) {
                    setInput(data.siteInfo);
                }
                return;
            }
            setLoading(false);
        }
        fetchInfo();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const inputCopy = { ...input };
        set(inputCopy, name, value);
        setInput(inputCopy);
    };

    const handleSubmit = async () => {
        setLoading(true);
        let res = null;
        if (input.id === "") {
            res = await CREATE(input);
        } else {
            res = await UPDATE(input);
        }
        setLoading(false);
    }


    return (
        <Grid container spacing={2} sx={{ maxWidth: '400px' }} >
            <Grid item xs={12}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Company Name"
                            name="companyName"
                            value={input.companyName}
                            size="small"
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Logo"
                            name="logo"
                            value={input.logo}
                            size="small"
                            onChange={handleChange}
                        />

                        {/* <Button variant="contained" color="primary">Upload</Button>
                        <Button variant="contained" color="secondary">Remove</Button> */}
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone 1"
                            name="phone1"
                            value={input.phone1}
                            size="small"
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Phone 2"
                            name="phone2"
                            value={input.phone2}
                            size="small"
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Fax"
                            name="fax"
                            value={input.fax}
                            size="small"
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="CR Number"
                            name="CRNumber"
                            value={input.CRNumber}
                            size="small"
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="VAT Number"
                            name="VATNumber"
                            value={input.VATNumber}
                            size="small"
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            value={input.email}
                            size="small"
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address"
                            name="address"
                            value={input.address}
                            size="small"
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Location"
                            name="location"
                            value={input.location}
                            size="small"
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>Save</Button>
                    </Grid>
                </Grid>
            </Grid>
            {errors.length > 0 && (
                <Grid item xs={12} sx={{ color: theme.palette.error.main }}>
                    <ul>
                        {errors.map((error: any) => (
                            <li key={error.message}>
                                <b className="uppercase">{error.path.join(".")}: </b>
                                {error.message}</li>
                        ))}
                    </ul>
                </Grid>
            )}
        </Grid>
    );
}
