import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { set } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useDebounce } from '../../../../../lib/use-debounce';
import { Supplier, User } from '@prisma/client';

const categoryFilter = createFilterOptions<CategoryOptionType>();
const nameFilter = createFilterOptions<NameOptionType>();
const typeFilter = createFilterOptions<TypeOptionType>();
const sizeFilter = createFilterOptions<SizeOptionType>();
const unitFilter = createFilterOptions<UnitOptionType>();


interface CategoryOptionType {
    inputValue?: string;
    title: string;
}

interface NameOptionType {
    inputValue?: string;
    title: string;
}

interface TypeOptionType {
    inputValue?: string;
    title: string;
}

interface SizeOptionType {
    inputValue?: string;
    title: string;
}

interface UnitOptionType {
    inputValue?: string;
    title: string;
}

const categories: CategoryOptionType[] = [
    { title: 'Paper' },
    { title: 'Flute' },
    { title: 'Karton' },
    { title: 'Sticker' },
    { title: 'Gum' },
    { title: 'Lamination' },
    { title: 'Double Tabe' },
    { title: 'Rebon' },
    { title: 'Ink' },
];

const names: NameOptionType[] = [
    { title: 'Invercote Paper' },
    { title: 'Kishu Matt' },
    { title: 'Kishu Glossy' },
    { title: 'Woodfree' },
    { title: 'Bristol' },
    { title: 'Craft' },
    { title: 'NCR' },
    { title: 'Conquerer' },
    { title: 'Ice Gold' },
    { title: 'Ice White' },
    { title: 'Ice Silver' },
    { title: 'Moqamash' },
];

const types: TypeOptionType[] = [
    { title: 'Invercote Paper' },
    { title: 'Kishu Matt' },
    { title: 'Kishu Glossy' },
    { title: 'Woodfree' },
    { title: 'Bristol' },
    { title: 'Craft' },
    { title: 'NCR' },
    { title: 'Conquerer' },
    { title: 'Ice Gold' },
    { title: 'Ice White' },
    { title: 'Ice Silver' },
    { title: 'Moqamash' },
];

const sizes: SizeOptionType[] = [
    { title: '100x70' },
    { title: '90x64' },
    { title: '90x60' },
    { title: '60x45' },
];

const units: UnitOptionType[] = [
    { title: 'Sheet' },
    { title: 'Meter' },
    { title: 'Kg' },
    { title: 'Piece' },
    { title: 'Ream' },
];

interface SupplierWithUser extends Partial<Supplier> {
    user: Partial<User>;
}

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
    const [input, setInput] = React.useState({
        id: uuidv4(),
        name: "",
        type: "",
        category: "",
        thickness: 0,
        size: "",
        unit: "",
        piecesInPackage: 0,
        packagePrice: 0,
        unitPrice: 0,
        description: "",
        supplier: "",
    });

    const [suppliers, setSuppliers] = React.useState<SupplierWithUser[]>([]);
    const [suppliersLoading, setSuppliersLoading] = React.useState<boolean>(false);
    const [search, setSearch] = React.useState<string>('');

    const debouncedSearch = useDebounce(search, 500);

    React.useEffect(() => {
        if (initialValues) {
            setInput(initialValues);
        }
    }, [initialValues]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const inputCopy = { ...input };
        set(inputCopy, name, +value);
        setInput(inputCopy);
    };

    const clear = () => {
        setInput({
            id: uuidv4(),
            name: "",
            type: "",
            category: "",
            thickness: 0,
            size: "",
            unit: "",
            piecesInPackage: 0,
            packagePrice: 0,
            unitPrice: 0,
            description: "",
            supplier: "",
        });
    };

    const handleClose = () => {
        clear();
        onClose();
    };

    React.useEffect(() => {
        if (input.piecesInPackage && input.packagePrice) {
            setInput((prev) => ({
                ...prev,
                unitPrice: (prev.packagePrice / prev.piecesInPackage),
            }));
        }
    }, [input.piecesInPackage, input.packagePrice]);

    React.useEffect(() => {
        const fetchSuppliers = async () => {
            setSuppliersLoading(true);

            const response = await fetch(`/api/data/supplier?filterByName=${debouncedSearch}`);

            if (response.ok) {
                const data = await response.json();
                setSuppliers(data.suppliers);
            }

            setSuppliersLoading(false);
        }

        fetchSuppliers();
    }, [debouncedSearch]);

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
                {initialValues ? `Update: ${initialValues.name}` : "Add Material"}
            </DialogTitle>
            <DialogContent dividers={true}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Autocomplete
                            fullWidth
                            value={input.category}
                            onChange={(event, newValue) => {
                                if (typeof newValue === 'string') {
                                    setInput((prev) => ({ ...prev, category: newValue }));
                                } else if (newValue && newValue.inputValue) {
                                    setInput((prev) => ({ ...prev, category: newValue.inputValue! }));
                                } else {
                                    setInput((prev) => ({ ...prev, category: newValue ? newValue.title : '' }));
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = categoryFilter(options, params);

                                const { inputValue } = params;
                                const isExisting = options.some((option) => inputValue === option.title);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        inputValue,
                                        title: `Add "${inputValue}"`,
                                    });
                                }

                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            id="categories"
                            options={categories}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                                if (option.inputValue) {
                                    return option.inputValue;
                                }
                                return option.title;
                            }}
                            renderOption={(props, option) => <li {...props}>{option.title}</li>}
                            freeSolo
                            renderInput={(params) => (
                                <TextField {...params} label="Category" fullWidth size='small' />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            fullWidth
                            value={input.name}
                            onChange={(event, newValue) => {
                                if (typeof newValue === 'string') {
                                    setInput((prev) => ({ ...prev, name: newValue }));
                                } else if (newValue && newValue.inputValue) {
                                    setInput((prev) => ({ ...prev, name: newValue.inputValue! }));
                                } else {
                                    setInput((prev) => ({ ...prev, name: newValue ? newValue.title : '' }));
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = nameFilter(options, params);

                                const { inputValue } = params;
                                const isExisting = options.some((option) => inputValue === option.title);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        inputValue,
                                        title: `Add "${inputValue}"`,
                                    });
                                }

                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            id="names"
                            options={names}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                                if (option.inputValue) {
                                    return option.inputValue;
                                }
                                return option.title;
                            }}
                            renderOption={(props, option) => <li {...props}>{option.title}</li>}
                            freeSolo
                            renderInput={(params) => (
                                <TextField {...params} label="Name" fullWidth size='small' />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            fullWidth
                            value={input.type}
                            onChange={(event, newValue) => {
                                if (typeof newValue === 'string') {
                                    setInput((prev) => ({ ...prev, type: newValue }));
                                } else if (newValue && newValue.inputValue) {
                                    setInput((prev) => ({ ...prev, type: newValue.inputValue! }));
                                } else {
                                    setInput((prev) => ({ ...prev, type: newValue ? newValue.title : '' }));
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = typeFilter(options, params);

                                const { inputValue } = params;
                                const isExisting = options.some((option) => inputValue === option.title);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        inputValue,
                                        title: `Add "${inputValue}"`,
                                    });
                                }

                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            id="types"
                            options={types}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                                if (option.inputValue) {
                                    return option.inputValue;
                                }
                                return option.title;
                            }}
                            renderOption={(props, option) => <li {...props}>{option.title}</li>}
                            freeSolo
                            renderInput={(params) => (
                                <TextField {...params} label="Type" fullWidth size='small' />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Thickness"
                            name="thickness"
                            value={input.thickness}
                            onChange={handleChange}
                            size='small'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            fullWidth
                            value={input.size}
                            onChange={(event, newValue) => {
                                if (typeof newValue === 'string') {
                                    setInput((prev) => ({ ...prev, size: newValue }));
                                } else if (newValue && newValue.inputValue) {
                                    setInput((prev) => ({ ...prev, size: newValue.inputValue! }));
                                } else {
                                    setInput((prev) => ({ ...prev, size: newValue ? newValue.title : '' }));
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = sizeFilter(options, params);

                                const { inputValue } = params;
                                const isExisting = options.some((option) => inputValue === option.title);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        inputValue,
                                        title: `Add "${inputValue}"`,
                                    });
                                }

                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            id="sizes"
                            options={sizes}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                                if (option.inputValue) {
                                    return option.inputValue;
                                }
                                return option.title;
                            }}
                            renderOption={(props, option) => <li {...props}>{option.title}</li>}
                            freeSolo
                            renderInput={(params) => (
                                <TextField {...params} label="Size" fullWidth size='small' />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            fullWidth
                            value={input.unit}
                            onChange={(event, newValue) => {
                                if (typeof newValue === 'string') {
                                    setInput((prev) => ({ ...prev, unit: newValue }));
                                } else if (newValue && newValue.inputValue) {
                                    setInput((prev) => ({ ...prev, unit: newValue.inputValue! }));
                                } else {
                                    setInput((prev) => ({ ...prev, unit: newValue ? newValue.title : '' }));
                                }
                            }}
                            filterOptions={(options, params) => {
                                const filtered = unitFilter(options, params);

                                const { inputValue } = params;
                                const isExisting = options.some((option) => inputValue === option.title);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        inputValue,
                                        title: `Add "${inputValue}"`,
                                    });
                                }

                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            id="units"
                            options={units}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                                if (option.inputValue) {
                                    return option.inputValue;
                                }
                                return option.title;
                            }}
                            renderOption={(props, option) => <li {...props}>{option.title}</li>}
                            freeSolo
                            renderInput={(params) => (
                                <TextField {...params} label="Unit" fullWidth size='small' />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Pieces in Package"
                            name="piecesInPackage"
                            value={input.piecesInPackage}
                            onChange={handleChange}
                            size='small'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Package Price"
                            name="packagePrice"
                            value={input.packagePrice}
                            onChange={handleChange}
                            size='small'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Unit Price"
                            name="unitPrice"
                            value={input.unitPrice}
                            size='small'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={input.description}
                            onChange={handleChange}
                            size='small'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth size='small'>
                            <InputLabel id="supplier">Supplier</InputLabel>
                            <Select
                                labelId="supplier"
                                id="supplier"
                                value={initialValues ? initialValues.supplier.id : input.supplier}
                                label="Supplier"
                                size='small'
                                onChange={(event: SelectChangeEvent) => {
                                    setInput((prev) => ({ ...prev, supplier: event.target.value }));
                                }}
                                name="supplier"
                            >
                                {suppliersLoading && (
                                    <MenuItem disabled>
                                        Loading...
                                    </MenuItem>
                                )}
                                {suppliers.map((supplier) => (
                                    <MenuItem key={supplier.id} value={supplier.id}>
                                        {supplier.companyName} - {supplier.managerName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
