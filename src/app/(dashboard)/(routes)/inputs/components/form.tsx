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


import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import Grid from '@mui/material/Grid';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Step from '@mui/material/Step';

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
        code: "",
        name: "",
        images: [
            {
                id: uuidv4(),
                url: "",
            },
            {
                id: uuidv4(),
                url: "",
            }
        ],
        structure: {
            peices: [{
                id: uuidv4(),
                name: "",
                fields: [{
                    id: uuidv4(),
                    name: "",
                    key: "A",
                    value: 0,
                }],
                equation: {
                    width: "",
                    height: "",
                }
            }]
        }
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

    const handleAddField = (index: number) => {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const inputCopy = { ...input };
        const field = {
            id: uuidv4(),
            name: "",
            key: alphabet[input.structure.peices[index].fields.length],
            value: 0,
        };
        inputCopy.structure.peices[index].fields.push(field);
        setInput(inputCopy);
    };

    const handleAddPeice = () => {
        const inputCopy = { ...input };
        const peice = {
            id: uuidv4(),
            name: "",
            fields: [{
                id: uuidv4(),
                name: "",
                key: "A",
                value: 0,
            }],
            equation: {
                width: "",
                height: "",
            }
        };
        inputCopy.structure.peices.push(peice);
        setInput(inputCopy);
    }

    const handleDeleteField = (peiceId: string, fieldId: string) => {
        const inputCopy = { ...input };
        const peiceIndex = inputCopy.structure.peices.findIndex((peice) => peice.id === peiceId);
        const fieldIndex = inputCopy.structure.peices[peiceIndex].fields.findIndex((field) => field.id === fieldId);
        inputCopy.structure.peices[peiceIndex].fields.splice(fieldIndex, 1);
        setInput(inputCopy);
    };

    const handleDeletePeice = (peiceId: string) => {
        const inputCopy = { ...input };
        const peiceIndex = inputCopy.structure.peices.findIndex((peice) => peice.id === peiceId);
        inputCopy.structure.peices.splice(peiceIndex, 1);
        setInput(inputCopy);
    }

    const getTotals = () => {
        const totals = {
            width: 0,
            height: 0,
        };
        input.structure.peices.forEach((peice) => {
            const width = convertTextToEquation(peice.equation.width, input, peice.id);
            const height = convertTextToEquation(peice.equation.height, input, peice.id);
            totals.width += width;
            totals.height += height;
        });
        return totals;
    };

    const clear = () => {
        setInput({
            code: "",
            name: "",
            images: [
                {
                    id: uuidv4(),
                    url: "",
                },
                {
                    id: uuidv4(),
                    url: "",
                }
            ],
            structure: {
                peices: [{
                    id: uuidv4(),
                    name: "",
                    fields: [{
                        id: uuidv4(),
                        name: "",
                        key: "A",
                        value: 0,
                    }],
                    equation: {
                        width: "",
                        height: "",
                    }
                }]
            }
        });

        setActiveStep(0);
    };

    const handleClose = () => {
        clear();
        onClose();
    };

    const convertFilesToBase64 = async (files: FileList) => {
        const promises = [];
        for (let i = 0; i < files.length; i++) {
            promises.push(new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(files[i]);
            }));
        }
        return Promise.all(promises);
    }


    return (
        <Dialog
            fullScreen
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
                        {initialValues ? `Update: ${initialValues.name}` : "Add Input"}
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
                    <Box sx={{ width: '100%', marginTop: 2 }}>
                        <Stepper activeStep={activeStep}>
                            {steps.map((label, index) => {
                                const stepProps: { completed?: boolean } = {};
                                const labelProps: {
                                    optional?: React.ReactNode;
                                } = {};
                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                        <Step>
                            {activeStep === steps.length ? (
                                <React.Fragment>
                                    <Typography sx={{ mt: 2, mb: 1 }}>
                                        All steps completed - you&apos;re finished
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                        <Box sx={{ flex: '1 1 auto' }} />
                                        <Button onClick={handleReset}>Reset</Button>
                                    </Box>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, padding: 2 }}>
                                        {input.images[0].url && (
                                            <Image src={input.images[0].url} width={200} height={200} alt="Image 1" />
                                        )}
                                        {input.images[1].url && (
                                            <Image src={input.images[1].url} width={200} height={200} alt="Image 2" />
                                        )}
                                    </Box>

                                    <List sx={{ paddingY: 4 }}>
                                        {activeStep === 0 && (
                                            <ListItem sx={{ display: "flex", alignItems: "start", gap: 2, [theme.breakpoints.down('sm')]: { flexDirection: "column" } }}>
                                                <TextField id="filled-basic" label="Code" variant="outlined" sx={{ width: "25%", [theme.breakpoints.down('sm')]: { width: "100%" } }} onChange={handleChange} value={input.code} name="code" />
                                                <TextField id="filled-basic" label="Name" variant="outlined" sx={{ width: "25%", [theme.breakpoints.down('sm')]: { width: "100%" } }} onChange={handleChange} name="name" value={input.name} />
                                                {/*
                                                <TextField id="filled-basic" label="Image 1" variant="outlined" sx={{ width: "33%", [theme.breakpoints.down('sm')]: { width: "100%" } }} onChange={handleChange} name="images[0].url" value={input.images[0].url} hidden />
                                                <TextField id="filled-basic" label="Image 2" variant="outlined" sx={{ width: "33%", [theme.breakpoints.down('sm')]: { width: "100%" } }} onChange={handleChange} name="images[1].url" value={input.images[1].url} hidden />
                                                */}
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "25%" }}>
                                                    <Typography variant="h6">Image 1</Typography>
                                                    <input type="file" name="images[0].url" onChange={async (e) => {
                                                        const fileUrl = await convertFilesToBase64(e.target.files as FileList);
                                                        const inputCopy = { ...input };
                                                        inputCopy.images[0].url = fileUrl[0] as string;
                                                        setInput(inputCopy);
                                                    }} />
                                                </Box>
                                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "25%" }}>
                                                    <Typography variant="h6">Image 2</Typography>
                                                    <input type="file" name="images[1].url" onChange={async (e) => {
                                                        const fileUrl = await convertFilesToBase64(e.target.files as FileList);
                                                        const inputCopy = { ...input };
                                                        inputCopy.images[1].url = fileUrl[0] as string;
                                                        setInput(inputCopy);
                                                    }
                                                    } />
                                                </Box>
                                            </ListItem>
                                        )}
                                        {activeStep === 1 && (
                                            <ListItem sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                                                {input.structure.peices.map((peice, index) => (
                                                    <Grid container key={peice.id} sx={{ margin: 0, width: "100%", background: theme.palette.action.hover, paddingX: 2, paddingLeft: 0, borderRadius: "10px" }} spacing={2}>
                                                        <Grid item sx={{ display: "flex", gap: 2, paddingTop: 2 }} xs={12}>
                                                            <ListItemText primary={peice.name} sx={{ paddingLeft: 2, width: "100%", [`& .MuiListItemText-primary`]: { fontSize: "1.2rem" } }} />
                                                            <IconButton aria-label="addField" sx={{ color: "info.main" }} onClick={() => handleAddField(index)}>
                                                                <AddIcon />
                                                            </IconButton>
                                                            {input.structure.peices.length > 1 && input.structure.peices.length - 1 === index && (
                                                                <IconButton aria-label="delete" sx={{ color: "error.main" }} onClick={() => handleDeletePeice(peice.id)}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            )}
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField id="filled-basic" label="Name" variant="outlined" sx={{ width: "100%" }} onChange={handleChange} name={`structure.peices[${index}].name`} value={peice.name} />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <TextField id="filled-basic" label="Width" variant="outlined" sx={{ width: "100%" }}
                                                                onChange={handleChange}
                                                                name={`structure.peices[${index}].equation.width`}
                                                                value={peice.equation.width}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <TextField id="filled-basic" label="Height" variant="outlined" sx={{ width: "100%" }}
                                                                onChange={handleChange}
                                                                name={`structure.peices[${index}].equation.height`}
                                                                value={peice.equation.height}
                                                            />
                                                        </Grid>
                                                        <List sx={{ padding: 2, width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                                                            {peice.fields.map((field, fieldIndex) => (
                                                                <ListItem key={field.id} sx={{ display: "flex", gap: 2, background: theme.palette.background.paper, borderRadius: "10px", paddingY: 2 }}>
                                                                    <TextField id="filled-basic" label="Key" variant="outlined" sx={{
                                                                        width: "5rem",
                                                                        [`& .MuiInputBase-input`]: { textAlign: "center" },
                                                                        [`& .MuiInputLabel-root`]: { textAlign: "center" },
                                                                        backgroundColor: theme.palette.action.hover
                                                                    }} value={field.key} color="info" />
                                                                    <TextField id="filled-basic" label="Name" variant="outlined" sx={{ width: "100%" }}
                                                                        onChange={handleChange}
                                                                        name={`structure.peices[${index}].fields[${fieldIndex}].name`}
                                                                        value={field.name}
                                                                    />
                                                                    {peice.fields.length > 1 && peice.fields.length - 1 === fieldIndex && (
                                                                        <IconButton aria-label="delete" sx={{ color: "error.main" }} onClick={() => handleDeleteField(peice.id, field.id)}>
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    )}
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Grid>
                                                ))}
                                                <Box sx={{ display: "flex", gap: 2, justifyContent: "end" }}>
                                                    <Button onClick={handleAddPeice}>
                                                        Add Peice
                                                    </Button>
                                                </Box>
                                            </ListItem>
                                        )}
                                        {activeStep === 2 && (
                                            <ListItem sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                                                {input.structure.peices.map((peice, index) => {
                                                    const width = convertTextToEquation(peice.equation.width, input, peice.id);
                                                    const height = convertTextToEquation(peice.equation.height, input, peice.id);
                                                    return (
                                                        <Grid container key={peice.id} sx={{ margin: 0, width: "100%", background: theme.palette.action.hover, padding: 2, borderRadius: "10px" }} spacing={2}>

                                                            <ListItemText primary={peice.name} sx={{ width: "100%", [`& .MuiListItemText-primary`]: { fontSize: "1.2rem" }, paddingBottom: 2 }} />
                                                            {peice.fields.map((field, fieldIndex) => (
                                                                <Grid item xs={6} key={field.id}>
                                                                    <TextField id="filled-basic" label={`${field.name} [${field.key}]`} variant="outlined" value={field.value} onChange={handleChange} name={`structure.peices[${index}].fields[${fieldIndex}].value`} sx={{ width: "100%" }} />
                                                                </Grid>
                                                            ))}
                                                            <ListItemText primary={`${width}mm x ${height}mm`} sx={{ width: "100%", [`& .MuiListItemText-primary`]: { fontSize: "1.2rem", fontWeight: "700" }, paddingTop: 2, textAlign: "end" }} />
                                                        </Grid>
                                                    )
                                                })}
                                                <ListItemText primary="Total" sx={{ width: "100%", [`& .MuiListItemText-primary`]: { fontSize: "1.2rem" }, paddingTop: 2, textAlign: "end" }} />
                                                <div style={{ display: "flex", flexDirection: "row", gap: 2, justifyContent: "end", fontSize: "1.2rem", fontWeight: "700", width: "100%" }}>
                                                    {getTotals().width}mm x {getTotals().height}mm
                                                </div>
                                            </ListItem>
                                        )}
                                    </List>
                                    <Divider />
                                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                        <Button
                                            color="inherit"
                                            disabled={activeStep === 0}
                                            onClick={handleBack}
                                            sx={{ mr: 1 }}
                                        >
                                            Back
                                        </Button>
                                        <Box sx={{ flex: '1 1 auto' }} />
                                        {activeStep === steps.length - 1 ? null : (
                                            <Button onClick={handleNext}>
                                                Next
                                            </Button>
                                        )}
                                    </Box>
                                </React.Fragment>
                            )}
                        </Step>
                    </Box>
                </ListItem>
            </List>
        </Dialog>
    );
}
