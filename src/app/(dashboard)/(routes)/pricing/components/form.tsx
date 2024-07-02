import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import DeleteIcon from '@mui/icons-material/Delete';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import { set } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import convertTextToEquation from '@/lib/convert-text-to-equation';
import { Customer, Delegate, Input, Material } from '@prisma/client';
import { useDebounce } from '../../../../../lib/use-debounce';
import { custom } from 'zod';
import PaperComponent from './blocks/paper';
import OffsetComponent from './blocks/offset';
import HotFoilComponent from './blocks/hot-foil';
import EmbossingComponent from './blocks/embossing';
import VarnishComponent from './blocks/varnish';
import LaminationComponent from './blocks/lamination';
import DieCutFormComponent from './blocks/die-cut';
import SilkScreenComponent from './blocks/silk-screen';
import FinishingComponent from './blocks/finishing';
import Image from 'next/image';


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
    onSubmit: (values: any) => Promise<any>;
    initialValues?: any;
}) {
    const theme = useTheme();
    const [input, setInput] = React.useState<any>({
        code: "",
        description: "",
        customerId: null,
        delegateId: null,
        structure: {
            input: {
                id: '',
                structure: {}
            },
            sheetsQuantity: 0,
            additional: []
        },
        total: 0,
        profit: 25,
        vat: 15,
        discount: 0,
        totalCost: 0,
    });

    React.useEffect(() => {
        function updateTotal() {
            const additional = input.structure.additional;

            let totalCost = 0;
            if (additional.length > 0) {
                additional.forEach((block: any) => {
                    totalCost += block.structure.totalCost;
                });
            }
            handleChange({ target: { name: "total", value: totalCost } });
        }

        updateTotal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(input.structure.additional)]);

    React.useEffect(() => {
        function updateTotalCost() {
            const costAfterProfit = +(+input.total * +input.profit / 100).toFixed(2) + +input.total;
            const costAfterVat = +(+(+costAfterProfit * +input.vat / 100).toFixed(2) + +costAfterProfit).toFixed(2);
            const costAfterDiscount = costAfterVat - +input.discount;
            handleChange({ target: { name: "totalCost", value: +(costAfterDiscount.toFixed(2)) } });
        }

        updateTotalCost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input.total, input.profit, input.vat, input.discount]);


    const costAfterProfit = +(+(+input.total * +input.profit / 100).toFixed(2) + +input.total).toFixed(2);
    const costAfterVat = +(+(+costAfterProfit * +input.vat / 100).toFixed(2) + +costAfterProfit).toFixed(2);
    const vatAmount = +(costAfterProfit * +input.vat / 100).toFixed(2);
    const profitAmount = +(costAfterProfit - input.total).toFixed(2);


    const [customers, setCustomers] = React.useState<Partial<Customer>[] | null>(null);
    const [customerLoading, setCustomerLoading] = React.useState<boolean>(false);
    const [customerSearch, setCustomerSearch] = React.useState<string>("");
    const debouncedCustomerSearch = useDebounce(customerSearch, 500);

    React.useEffect(() => {
        const fetchCustomers = async () => {
            setCustomerLoading(true);

            const response = await fetch(`/api/data/customer?filterByName=${debouncedCustomerSearch}`);

            if (response.ok) {
                const data = await response.json();
                setCustomers(data.customers);
            }

            setCustomerLoading(false);
        }
        fetchCustomers();
    }, [debouncedCustomerSearch]);

    const [delegates, setDelegate] = React.useState<Partial<Delegate>[] | null>(null);
    const [delegateLoading, setDelegateLoading] = React.useState<boolean>(false);
    const [delegateSearch, setDelegateSearch] = React.useState<string>("");
    const debouncedDelegateSearch = useDebounce(delegateSearch, 500);

    React.useEffect(() => {
        const fetchCustomers = async () => {
            setDelegateLoading(true);

            const response = await fetch(`/api/data/delegate?filterByName=${debouncedDelegateSearch}`);

            if (response.ok) {
                const data = await response.json();
                setDelegate(data.delegates);
            }

            setDelegateLoading(false);
        }
        fetchCustomers();
    }, [debouncedDelegateSearch]);

    const [inputs, setInputs] = React.useState<Partial<Input>[] | null>(null);
    const [inputsLoading, setInputsLoading] = React.useState<boolean>(false);
    const [inputSearch, setInputSearch] = React.useState<string>("");
    const debouncedInputSearch = useDebounce(inputSearch, 500);

    React.useEffect(() => {
        const fetchInputs = async () => {
            setInputsLoading(true);

            const response = await fetch(`/api/data/input?filterByName=${debouncedInputSearch}`);

            if (response.ok) {
                const data = await response.json();
                setInputs(data.inputs);
            }

            setInputsLoading(false);
        }
        fetchInputs();
    }, [debouncedInputSearch]);

    const additionalFields = [
        {
            id: uuidv4(),
            code: 1,
            name: "Paper",
            peiceId: "all",
            structure: {
                quantity: 0,
                upsInSheet: 1,
                sheetsQuantity: 0,
                destroyRate: 100,
                material: {
                    id: "",
                    thickness: 0,
                    size: "",
                    piecesInPackage: 0,
                    unitPrice: 0,
                    suppluierId: null,
                    materialCategory: "",
                    materialType: "",
                },
                paperTotal: 0,
                totalCost: 0,
                vat: {
                    active: false,
                    value: 15,
                }
            }
        },
        {
            id: uuidv4(),
            code: 2,
            name: "Offset Printing",
            peiceId: "all",
            structure: {
                quantity: 0,
                printSize: 1,
                faces: [
                    {
                        id: 1,
                        active: true,
                        name: "Face Side",
                        colorType: "",
                        numberOfColor: "",
                        costFirstThousand: 0,
                        costNextThousand: 0,
                        customPrice: 0,
                        totalCost: 0,
                    },
                    {
                        id: 2,
                        active: false,
                        name: "Back Side",
                        colorType: "",
                        numberOfColor: "",
                        costFirstThousand: 0,
                        costNextThousand: 0,
                        customPrice: 0,
                        totalCost: 0,
                    }
                ],
                totalCost: 0,
            }
        },
        {
            id: uuidv4(),
            code: 3,
            name: "Hot Foil Printing",
            peiceId: "all",
            structure: {
                quantity: 0,
                paperSize: 1,
                printSize: '',
                numberOfColor: 1,
                costPrint: 0,
                clicheCost: 0,
                totalCost: 0,
            }
        },
        {
            id: uuidv4(),
            code: 4,
            name: "Embossing Printing",
            peiceId: "all",
            structure: {
                quantity: 0,
                paperSize: 1,
                embossingSize: '',
                costPrint: 0,
                clicheCost: 0,
                totalCost: 0,
            }
        },
        {
            id: uuidv4(),
            code: 5,
            name: "Die Cut & Form",
            peiceId: "all",
            structure: {
                quantity: 0,
                dieCutSize: 1,
                costFirstThousand: 0,
                costNextThousand: 0,
                dieCutCost: 0,
                dieCutForm: 0,
                dieCutFormCost: 0,
                formCost: 0,
                totalCost: 0,
            }
        },
        {
            id: uuidv4(),
            code: 6,
            name: "Lamination",
            peiceId: "all",
            structure: {
                faces: [
                    {
                        id: 1,
                        active: true,
                        name: "Face Side",
                        laminationType: "",
                        laminationCost: 0,
                        laminationSize: 1,
                        totalCost: 0,
                    },
                    {
                        id: 2,
                        active: false,
                        name: "Back Side",
                        laminationType: "",
                        laminationCost: 0,
                        laminationSize: 1,
                        totalCost: 0,
                    }
                ],
                totalCost: 0,
            }
        },
        {
            id: uuidv4(),
            code: 7,
            name: "Varnish",
            peiceId: "all",
            structure: {
                faces: [
                    {
                        id: 1,
                        active: false,
                        name: "Face Side",
                        varnishType: "",
                        varnishCost: 0,
                        totalCost: 0,
                    },
                    {
                        id: 2,
                        active: false,
                        name: "Back Side",
                        varnishType: "",
                        varnishCost: 0,
                        totalCost: 0,
                    }
                ],
                totalCost: 0,
            }
        },
        {
            id: uuidv4(),
            code: 8,
            name: "Finishing",
            peiceId: "all",
            structure: {
                plasticWindow: {
                    active: false,
                    quantity: 0,
                    cost: 0,
                    size: '',
                    totalCost: 0,
                },
                gum: {
                    active: false,
                    quantity: 0,
                    point: 0,
                    pointCost: 0,
                    totalCost: 0,
                },
                pasting: {
                    active: false,
                    quantity: 0,
                    cost: 0,
                    totalCost: 0,
                },
                cut: {
                    active: false,
                    quantity: 0,
                    cost: 0,
                    totalCost: 0,
                },
                binding: {
                    active: false,
                    quantity: 0,
                    cost: 0,
                    totalCost: 0,
                },
                packing: {
                    active: false,
                    quantity: 0,
                    cost: 0,
                    totalCost: 0,
                },
                delivery: {
                    active: false,
                    totalCost: 0,
                },
                totalCost: 0,
            }
        },
        {
            id: uuidv4(),
            code: 9,
            name: "Silk Screen Print",
            peiceId: "all",
            structure: {
                quantity: 0,
                paperSize: 1,
                printSize: '',
                numberOfColor: 1,
                costPrint: 0,
                totalCost: 0,
            }
        }
    ];

    const [selectedBlock, setSelectedBlock] = React.useState<any>(additionalFields[0].code);

    const [loading, setLoading] = React.useState(false);
    const [errors, setErrors] = React.useState([]);

    React.useEffect(() => {
        if (initialValues) {
            setInput(JSON.parse(JSON.stringify(initialValues)));
        }
    }, [initialValues]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | { target: { name: string, value: any } }, number?: boolean) => {
        const { name, value } = event.target;
        const inputCopy = { ...input };
        set(inputCopy, name, number ? parseFloat(
            (value === "" || value === null || value === undefined || isNaN(value)) ? 0 : value
        ) : value);
        setInput(inputCopy);
    };

    const clear = () => {
        setInput({
            code: "",
            description: "",
            customerId: null,
            delegateId: null,
            structure: {
                input: {
                    id: '',
                    structure: {}
                },
                sheetsQuantity: 0,
                additional: []
            },
            total: 0,
            profit: 25,
            vat: 15,
            discount: 0,
            totalCost: 0,
        });

        setErrors([]);
        setCustomerSearch("");
        setInputSearch("");
    };

    const getTotals = () => {
        const totals = {
            width: 0,
            height: 0,
        };
        input.structure.input.structure.peices.forEach((peice: any) => {
            const width = convertTextToEquation(peice.equation.width, input.structure.input, peice.id);
            const height = convertTextToEquation(peice.equation.height, input.structure.input, peice.id);
            totals.width += width;
            totals.height += height;
        });
        return totals;
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
            fullScreen
        >
            <DialogTitle id="scroll-dialog-title">
                {initialValues ? `Update: ${initialValues.name}` : "Add Qutation"}
            </DialogTitle>
            <DialogContent dividers={true}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{ fontWeight: "600" }}>
                                            Customer Details
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Autocomplete
                                            fullWidth
                                            options={customers ? customers : []}
                                            getOptionLabel={(option) => option.companyName ? option.companyName : ""}
                                            renderOption={(props, option) => (
                                                customerLoading ? <ListItem key={uuidv4()}>Loading...</ListItem> : <ListItem {...props} key={option.id}> <ListItemText primary={option.companyName} /> </ListItem>
                                            )}
                                            defaultValue={initialValues ? customers?.find((customer) => customer.id === initialValues.customerId) : null}
                                            renderInput={(params) => <TextField {...params} label="Customer" />}
                                            onChange={(event, value) => {
                                                setInput({ ...input, customerId: value ? value.id : null });
                                            }}
                                            onInputChange={(event, value) => {
                                                setCustomerSearch(value);
                                            }}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            selectOnFocus
                                            clearOnBlur
                                            handleHomeEndKeys
                                            size='small'
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            placeholder="Code"
                                            name="customerId"
                                            value={input.customerId ? customers?.find((customer) => customer.id === input.customerId)?.code : ""}
                                            disabled
                                            size='small'
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            placeholder="Phone"
                                            name="customerPhone"
                                            value={input.customerId ? customers?.find((customer) => customer.id === input.customerId)?.phone1 : ""}
                                            disabled
                                            size='small'
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Autocomplete
                                            fullWidth
                                            options={delegates ? delegates : []}
                                            getOptionLabel={(option) => option.name ? option.name : ""}
                                            renderOption={(props, option) => (
                                                delegateLoading ? <ListItem key={uuidv4()}>Loading...</ListItem> : <ListItem {...props} key={option.id}> <ListItemText primary={option.name} /> </ListItem>
                                            )}
                                            defaultValue={initialValues ? delegates?.find((delegate) => delegate.id === initialValues.delegateId) : null}
                                            renderInput={(params) => <TextField {...params} label="Delegate" />}
                                            onChange={(event, value) => {
                                                setInput({ ...input, delegateId: value ? value.id : null });
                                            }}
                                            onInputChange={(event, value) => {
                                                setDelegateSearch(value);
                                            }}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            selectOnFocus
                                            clearOnBlur
                                            handleHomeEndKeys
                                            size='small'
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            placeholder="Code"
                                            name="delegateId"
                                            value={input.delegateId ? delegates?.find((delegate) => delegate.id === input.delegateId)?.code : ""}
                                            disabled
                                            size='small'
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            placeholder="Phone"
                                            name="delegatePhone"
                                            value={input.delegateId ? delegates?.find((delegate) => delegate.id === input.delegateId)?.phone1 : ""}
                                            disabled
                                            size='small'
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <TextField
                                            fullWidth
                                            label="Quantity"
                                            name="structure.sheetsQuantity"
                                            value={input.structure.sheetsQuantity}
                                            onChange={(e) => handleChange(e, true)}
                                            size='small'
                                        />
                                    </Grid>
                                    <Grid item xs={8}>
                                        <TextField
                                            fullWidth
                                            label="Description"
                                            name="description"
                                            value={input.description}
                                            onChange={handleChange}
                                            size='small'
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                                                    Box Dimensions
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Autocomplete
                                                    fullWidth
                                                    options={inputs ? inputs : []}
                                                    getOptionLabel={(option) => option.name ? option.name : ""}
                                                    renderOption={(props, option) => (
                                                        customerLoading ? <ListItem key={uuidv4()}>Loading...</ListItem> : <ListItem {...props} key={option.id}> <ListItemText primary={option.name} />
                                                            {option.images && option.images.length > 0 && <Image src={option.images[0]} alt={option.name || ""} style={{ width: "50px", height: "50px" }} width={50} height={50} />}
                                                        </ListItem>
                                                    )}
                                                    value={inputs?.find((inputDb) => inputDb.id === input.structure.input.id)}
                                                    renderInput={(params) => <TextField {...params} label="Select a box" />}
                                                    onChange={(event, value) => {
                                                        handleChange({ target: { name: "structure.input.id", value: value ? value.id as string : "" } });
                                                        const inputContent = value ? value.structure : {};
                                                        const inputCopy = { ...input };
                                                        inputCopy.structure.input.structure = inputContent;
                                                        setInput(inputCopy);
                                                    }}
                                                    onInputChange={(event, value) => {
                                                        setInputSearch(value);
                                                    }}
                                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                                    selectOnFocus
                                                    clearOnBlur
                                                    handleHomeEndKeys
                                                    size='small'
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Box Code"
                                                    name="boxCode"
                                                    value={input.structure.input.id ? inputs?.find((inputDb) => inputDb.id === input.structure.input.id)?.code : ""}
                                                    disabled
                                                    size='small'
                                                />
                                            </Grid>
                                        </Grid>
                                        {input.structure.input.structure && input.structure.input.structure.peices && input.structure.input.structure.peices.length > 0 && (
                                            <Grid item xs={12} style={{ paddingTop: "1rem" }} key={input.structure.input.id}>
                                                <Grid container sx={{ margin: 0, width: "100%", background: theme.palette.action.hover, padding: 2, borderRadius: "10px" }} spacing={2}>
                                                    {input.structure.input.structure.peices.map((peice: any, index: any) => {
                                                        const width = convertTextToEquation(peice.equation.width, input.structure.input, peice.id);
                                                        const height = convertTextToEquation(peice.equation.height, input.structure.input, peice.id);
                                                        return (
                                                            <div key={peice.id} style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                                                                <div style={{ display: "flex", flexDirection: "row", gap: 2, justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                                                    <span>{peice.name}</span>
                                                                    <span>{`${width}mm x ${height}mm`}</span>
                                                                </div>
                                                                <div style={{ display: "flex", flexDirection: "row", gap: 10, width: "100%", alignItems: "center", flexWrap: "wrap", paddingTop: "1rem" }}>
                                                                    {peice.fields.map((field: any, fieldIndex: any) => (
                                                                        <div key={field.id} style={{ width: "18%" }}>
                                                                            <TextField size='small' id="filled-basic" label={`${field.name} [${field.key}]`} variant="outlined" value={field.value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e, true)} name={`structure.input.structure.peices[${index}].fields[${fieldIndex}].value`} sx={{ width: "100%" }} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                    <div style={{ display: "flex", flexDirection: "row", gap: 2, justifyContent: "end", fontSize: "1.1rem", fontWeight: "600", width: "100%", flexWrap: "nowrap", textWrap: "nowrap", alignContent: "center" }}>
                                                        Total:
                                                        {" " + getTotals().width}mm x {getTotals().height}mm
                                                    </div>
                                                </Grid>
                                            </Grid>
                                        )}
                                    </Grid>
                                    <Grid item xs={12} style={{ paddingLeft: "2rem" }}>
                                        <Grid container spacing={2} sx={{ background: theme.palette.action.hover, padding: 2, borderRadius: "10px", marginTop: 2 }} alignContent="end" direction="column">
                                            <Grid item xs={12}>
                                                <Grid container spacing={2} sx={{ justifyContent: "end" }}>
                                                    <Grid item xs={3}>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField
                                                            fullWidth
                                                            label="Total Cost"
                                                            name="total"
                                                            value={input.total.toFixed(2)}
                                                            onChange={handleChange}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container spacing={2} sx={{ justifyContent: "end" }}>
                                                    <Grid item xs={2}>
                                                        <TextField
                                                            fullWidth
                                                            label="Profit"
                                                            name="profit"
                                                            value={+input.profit}
                                                            onChange={(e) => handleChange(e, true)}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="Profit Amount"
                                                            value={profitAmount || 0}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField
                                                            fullWidth
                                                            value={costAfterProfit}
                                                            onChange={handleChange}
                                                            disabled
                                                            label="Cost After Profit"
                                                            size='small'
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container spacing={2} sx={{ justifyContent: "end" }}>
                                                    <Grid item xs={2}>
                                                        <TextField
                                                            fullWidth
                                                            label="VAT"
                                                            name="vat"
                                                            value={+input.vat}
                                                            onChange={(e) => handleChange(e, true)}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="VAT Amount"
                                                            value={vatAmount || 0}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <TextField
                                                            fullWidth
                                                            value={costAfterVat}
                                                            onChange={handleChange}
                                                            disabled
                                                            size='small'
                                                            label="Cost After VAT"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container spacing={2} sx={{ justifyContent: "end" }}>
                                                    <Grid item xs={4}>
                                                        <TextField
                                                            fullWidth
                                                            label="Discount"
                                                            name="discount"
                                                            value={input.discount}
                                                            onChange={(e) => handleChange(e, true)}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Grid container spacing={2} sx={{ justifyContent: "end" }}>
                                                    <Grid item xs={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="Pics Cost"
                                                            value={(input.totalCost / (input.structure.sheetsQuantity || 1)).toFixed(2) || 0}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Total"
                                                            name="total"
                                                            value={input.totalCost || 0}
                                                            onChange={handleChange}
                                                            size='small'
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    {input.structure.input.structure && input.structure.input.structure.peices && input.structure.input.structure.peices.length > 0 && (
                        <Grid item xs={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sx={{ marginTop: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: "600" }}>
                                        Additional Details
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    {input.structure.additional.map((block: any) => {
                                        const blockIndex = input.structure.additional.findIndex((blockP: any) => blockP.id === block.id);
                                        return (
                                            <div key={block.id} style={{ width: "100%", paddingLeft: "1rem" }}>
                                                <Grid container spacing={2} key={block.id} sx={{ background: theme.palette.action.hover, padding: 2, borderRadius: "10px", marginTop: 2 }}>
                                                    <Grid item xs={12} sx={{ padding: "0!important" }}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12}>
                                                                <Grid container spacing={2} >
                                                                    <Grid item xs={7.4}>
                                                                        <Typography variant="h6" sx={{ fontWeight: "600", '& .MuiTypography-root': { paddingTop: 0 } }}>
                                                                            {block.name}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item xs={4}>
                                                                        <FormControl fullWidth>
                                                                            <InputLabel id="selectPart">select a part</InputLabel>
                                                                            <Select
                                                                                labelId="selectPart"
                                                                                id="selectPart"
                                                                                value={block.peiceId ? block.peiceId : "all"}
                                                                                label="select a part"
                                                                                name={`structure.additional[${blockIndex}].peiceId`}
                                                                                onChange={(e: SelectChangeEvent) => handleChange(e)}
                                                                                size='small'
                                                                            >
                                                                                <MenuItem value="all" key="all">All</MenuItem>
                                                                                {input.structure.input.structure.peices.map((peice: any) => (
                                                                                    <MenuItem value={peice.id} key={peice.id}>{peice.name}</MenuItem>
                                                                                ))}
                                                                            </Select>
                                                                        </FormControl>
                                                                    </Grid>
                                                                    <Grid item xs={.5} sx={{ textAlign: "end" }}>
                                                                        <IconButton aria-label="delete" onClick={() => {
                                                                            const inputCopy = { ...input };
                                                                            inputCopy.structure.additional = inputCopy.structure.additional.filter((blockP: any) => blockP.id !== block.id);
                                                                            setInput(inputCopy);
                                                                        }}>
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            {block.code === 1 && (
                                                                <PaperComponent paper={block} input={input} handleChange={handleChange} initialValues={initialValues} />
                                                            )}
                                                            {block.code === 2 && (
                                                                <OffsetComponent offset={block} input={input} handleChange={handleChange} initialValues={initialValues} />
                                                            )}
                                                            {block.code === 3 && (
                                                                <HotFoilComponent hotFoil={block} input={input} handleChange={handleChange} initialValues={initialValues} />
                                                            )}
                                                            {block.code === 4 && (
                                                                <EmbossingComponent embossing={block} input={input} handleChange={handleChange} initialValues={initialValues} />
                                                            )}
                                                            {block.code === 5 && (
                                                                <DieCutFormComponent dieCut={block} input={input} handleChange={handleChange} initialValues={initialValues} />
                                                            )}
                                                            {block.code === 6 && (
                                                                <LaminationComponent lamination={block} input={input} handleChange={handleChange} initialValues={initialValues} />
                                                            )}
                                                            {block.code === 7 && (
                                                                <VarnishComponent varnish={block} input={input} handleChange={handleChange} initialValues={initialValues} />
                                                            )}
                                                            {block.code === 8 && (
                                                                <FinishingComponent finishing={block} input={input} handleChange={handleChange} initialValues={initialValues} />
                                                            )}
                                                            {block.code === 9 && (
                                                                <SilkScreenComponent silkScreen={block} input={input} handleChange={handleChange} initialValues={initialValues} />
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </div>
                                        )
                                    })}
                                    <Grid sx={{ display: "flex", flexDirection: "row", gap: 2, marginTop: 2 }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="demo-simple-select-label">add block</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                value={selectedBlock}
                                                label="add block"
                                                onChange={(e: SelectChangeEvent) => setSelectedBlock(e.target.value)}
                                                size="small"
                                            >
                                                {additionalFields.map((field) => (
                                                    <MenuItem value={field.code} key={field.id}>{field.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <Button onClick={() => {
                                            const selectedBlockData = additionalFields.find((field) => field.code === selectedBlock);
                                            const inputCopy = { ...input };
                                            inputCopy.structure.additional.push(selectedBlockData);
                                            setInput(inputCopy);
                                        }}>
                                            Add
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={clear}>Clear</Button>
                <Button
                    onClick={async () => {
                        setLoading(true);
                        await onSubmit(input).then((res: any) => {
                            console.log(res);
                            setLoading(false);
                            setInput({
                                code: res.code,
                                customerId: res.customerId,
                                structure: {
                                    input: {
                                        id: '',
                                        structure: {}
                                    },
                                    sheetsQuantity: 0,
                                    additional: []
                                },
                                total: 0,
                                profit: 25,
                                vat: 15,
                                discount: 0,
                                totalCost: 0,
                            });
                        }).catch((e: any) => {
                            setLoading(false);
                            setErrors(JSON.parse(e.message));
                        });
                    }}
                    disabled={loading}
                    variant="contained" color="primary"
                >Save and Add New</Button>
                <Button onClick={
                    async () => {
                        setLoading(true);
                        await onSubmit(input).then(() => {
                            setLoading(false);
                            handleClose();
                        }).catch((e: any) => {
                            setLoading(false);
                            setErrors(JSON.parse(e.message));
                        })
                    }}
                    disabled={loading}
                    variant="contained" color="primary">
                    {initialValues ? "Save" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
