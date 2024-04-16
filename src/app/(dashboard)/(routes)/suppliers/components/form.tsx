import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';


import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

import Grid from '@mui/material/Grid';

import Select, { SelectChangeEvent } from '@mui/material/Select';

import Image from 'next/image';

import { set } from 'lodash';

import { v4 as uuidv4 } from 'uuid';
import convertTextToEquation from '@/lib/convert-text-to-equation';

const steps = ['Input Details', 'Input Strucure', 'Preview'];


const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Form({
    open,
    onClose,
    onSubmit,
    initialValues,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    initialValues?: any;
}) {
    const theme = useTheme();
    const [activeStep, setActiveStep] = React.useState(0);
    const [input, setInput] = React.useState({
        managerName: "",
        companyName: "",
        vatNumber: "",
        crNumber: "",
        phone1: "",
        phone2: "",
        fax: "",
        email: "",
        address: "",
        location: "",
        dealingType: "",
    });

    React.useEffect(() => {
        if (initialValues) {
            setInput(initialValues);
        }
    }, [initialValues]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const inputCopy = { ...input };
        set(inputCopy, name, value);
        setInput(inputCopy);
    };

    const clear = () => {
        setInput({
            managerName: "",
            companyName: "",
            vatNumber: "",
            crNumber: "",
            phone1: "",
            phone2: "",
            fax: "",
            email: "",
            address: "",
            location: "",
            dealingType: "",
        });

        setActiveStep(0);
    };

    const handleClose = () => {
        clear();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <AppBar sx={{ position: 'relative' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {initialValues ? `Update: ${initialValues.managerName}` : "Add Supplier"}
                    </Typography>
                    <Button autoFocus color="inherit" onClick={() => {
                        onSubmit(input);
                        handleClose();
                    }}>
                        {initialValues ? "Save" : "Create"}
                    </Button>
                </Toolbar>
            </AppBar>
            <List>
                <ListItem>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            {activeStep === 0 && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Manager Name"
                                            name="managerName"
                                            value={input.managerName}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Company Name"
                                            name="companyName"
                                            value={input.companyName}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="VAT Number"
                                            name="vatNumber"
                                            value={input.vatNumber}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="CR Number"
                                            name="crNumber"
                                            value={input.crNumber}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Phone 1"
                                            name="phone1"
                                            value={input.phone1}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Phone 2"
                                            name="phone2"
                                            value={input.phone2}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Fax"
                                            name="fax"
                                            value={input.fax}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            value={input.email}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Address"
                                            name="address"
                                            value={input.address}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Location"
                                            name="location"
                                            value={input.location}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Dealing Type</InputLabel>
                                        <Select
                                            fullWidth
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={input.dealingType}
                                            label="Dealing Type"
                                            onChange={(event: SelectChangeEvent) => {
                                                setInput({
                                                    ...input,
                                                    dealingType: event.target.value,
                                                });
                                            }}
                                        >
                                            <MenuItem value="cash">Cash</MenuItem>
                                            <MenuItem value="credit">Credit</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </ListItem>
            </List>
        </Dialog>
    );
}
