import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { set } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
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
        id: uuidv4(),
        name: "",
        type: "",
        phone1: "",
        phone2: "",
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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const inputCopy = { ...input };
        set(inputCopy, name, value);
        setInput(inputCopy);
    };

    const clear = () => {
        setInput({
            id: uuidv4(),
            name: "",
            type: "",
            phone1: "",
            phone2: "",
            email: "",
            address: "",
            location: "",
            dealingType: "",
        });
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
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
            scroll="body"
            fullWidth
            maxWidth="xs"
        >
            <DialogTitle id="scroll-dialog-title">
                {initialValues ? `Update: ${initialValues.name}` : "Add Delegate"}
            </DialogTitle>
            <DialogContent dividers={true}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={input.name}
                                    onChange={handleChange}
                                    size='small'
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth size='small'>
                                    <InputLabel id="demo-simple-select-label1">Type</InputLabel>
                                    <Select
                                        fullWidth
                                        labelId="demo-simple-select-label1"
                                        id="demo-simple-select"
                                        value={input.type}
                                        label="Type"
                                        onChange={(event: SelectChangeEvent) => {
                                            setInput({
                                                ...input,
                                                type: event.target.value,
                                            });
                                        }}
                                        size='small'
                                    >
                                        <MenuItem value="company">Company Delegate</MenuItem>
                                        <MenuItem value="freelancer">Freelancer</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone 1"
                                    name="phone1"
                                    value={input.phone1}
                                    onChange={handleChange}
                                    size='small'
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone 2"
                                    name="phone2"
                                    value={input.phone2}
                                    size='small'
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={input.email}
                                    size='small'
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Address"
                                    name="address"
                                    value={input.address}
                                    size='small'
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    name="location"
                                    value={input.location}
                                    size='small'
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth size='small'>
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
                                        size='small'
                                    >
                                        <MenuItem value="cash">Cash</MenuItem>
                                        <MenuItem value="credit">Credit</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={() => {
                    onSubmit(input);
                    handleClose();
                }} variant="contained" color="primary">
                    {initialValues ? "Save" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
