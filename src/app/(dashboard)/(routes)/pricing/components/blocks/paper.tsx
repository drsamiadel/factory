import * as React from 'react';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Checkbox from '@mui/material/Checkbox';
import { v4 as uuidv4 } from 'uuid';
import { Material } from '@prisma/client';
import { useDebounce } from '../../../../../../lib/use-debounce';
import Divider from '@mui/material/Divider';

const PaperComponent = ({ paper, input, handleChange, initialValues }: { paper: any, input: any, handleChange: any, initialValues?: any }) => {
    const [materials, setMaterials] = React.useState<Partial<Material>[] | null>(null);
    const [materialsLoading, setMaterialsLoading] = React.useState<boolean>(false);
    const [materialSearch, setMaterialSearch] = React.useState<string>("");
    const debouncedMaterialSearch = useDebounce(materialSearch, 500);


    React.useEffect(() => {
        const fetchMaterials = async () => {
            setMaterialsLoading(true);

            const response = await fetch(`/api/data/material?filterByName=${debouncedMaterialSearch}`);

            if (response.ok) {
                const data = await response.json();
                setMaterials(data.materials);
            }

            setMaterialsLoading(false);
        }
        fetchMaterials();
    }, [debouncedMaterialSearch]);

    const blockIndex = input.structure.additional.findIndex((block: any) => block.id === paper.id);

    const sheetsQuantity = (input.structure.sheetsQuantity / paper.structure.upsInSheet).toFixed(0);

    React.useEffect(() => {
        function calculatePaperTotal() {
            const paperTotal = (+sheetsQuantity + +paper.structure.destroyRate || 0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.paperTotal`, value: paperTotal } });
        }
        calculatePaperTotal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, paper.structure.destroyRate, paper.structure.material]);

    React.useEffect(() => {
        function calculatePaperCost() {
            const paperCost = (+sheetsQuantity + +paper.structure.destroyRate || 0) * (materials?.find((material) => material.id === paper.structure.material)?.unitPrice || 0) * (1 + (paper.structure.vat.active ? paper.structure.vat.value / 100 : 0));
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: paperCost } });
        }
        calculatePaperCost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, paper.structure.destroyRate, paper.structure.material, paper.structure.vat.active, paper.structure.vat.value]);

    React.useEffect(() => {
        function calculateQuantity() {
            const quantity = input.structure.sheetsQuantity ? input.structure.sheetsQuantity : 0;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.quantity`, value: quantity } });
        }
        calculateQuantity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input.structure.sheetsQuantity]);

    React.useEffect(() => {
        function calculateSheetsQuantity() {
            const sheetsQuantity = ((+paper.structure.quantity ? +paper.structure.quantity : 0) / (+paper.structure.upsInSheet ? +paper.structure.upsInSheet : 1)).toFixed(0);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.sheetsQuantity`, value: +sheetsQuantity } });
        }
        calculateSheetsQuantity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paper.structure.quantity, paper.structure.upsInSheet]);

    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="selectPart">select a part</InputLabel>
                        <Select
                            labelId="selectPart"
                            id="selectPart"
                            value={paper.peiceId ? paper.peiceId : "all"}
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
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Quantity"
                        name={`structure.additional[${blockIndex}].structure.quantity`}
                        value={paper.structure.quantity || 0}
                        onChange={handleChange}
                        size='small'
                        disabled
                    />
                </Grid>
                <Grid item xs={2}>
                    <Autocomplete
                        id="combo-for-ups"
                        options={[1, 2, 3, 4, 5, 6]}
                        getOptionLabel={(option) => option.toString()}
                        renderInput={(params) => <TextField {...params} label="UPS in Sheet" />}
                        value={paper.structure.upsInSheet}
                        onChange={(e, value) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.upsInSheet`, value } }, true)}
                        onInputChange={(e, value) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.upsInSheet`, value } }, true)}
                        size='small'
                        freeSolo
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Sheets Quantity"
                        name={`structure.additional[${blockIndex}].structure.sheetsQuantity`}
                        value={paper.structure.sheetsQuantity || 0}
                        onChange={(e) => handleChange(e)}
                        size='small'
                        disabled
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Destroy Rate"
                        name={`structure.additional[${blockIndex}].structure.destroyRate`}
                        value={paper.structure.destroyRate || 0}
                        onChange={(e) => handleChange(e)}
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <Autocomplete
                        fullWidth
                        options={materials ? materials : []}
                        getOptionLabel={(option) => option.name ? option.name : ""}
                        renderOption={(props, option) => (
                            materialsLoading ? <ListItem key={uuidv4()}>Loading...</ListItem> : <ListItem {...props} key={option.id}> <ListItemText primary={`${option.name} [${option.type} - ${option.thickness} - ${option.size}]`} /> </ListItem>
                        )}
                        defaultValue={initialValues ? materials?.find((customer) => customer.id === initialValues.customerId) : null}
                        renderInput={(params) => <TextField {...params} label="Material" />}
                        onChange={(event, value) => {
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material`, value: value ? value.id : null } });
                        }
                        }
                        onInputChange={(event, value) => {
                            setMaterialSearch(value);
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Type"
                        value={materials?.find((material) => material.id === paper.structure.material)?.type || ""}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Thickness"
                        value={materials?.find((material) => material.id === paper.structure.material)?.thickness || ""}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Size"
                        value={materials?.find((material) => material.id === paper.structure.material)?.size || ""}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Pieces in Package"
                        value={materials?.find((material) => material.id === paper.structure.material)?.piecesInPackage || ""}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        fullWidth
                        label="Unit Price"
                        value={materials?.find((material) => material.id === paper.structure.material)?.unitPrice || ""}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
                </Grid>
                <Grid item xs={12}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2} sx={{ justifyContent: "end", alignItems: "end" }} direction="column">
                        <Grid item xs={2}>
                            <TextField
                                fullWidth
                                label="Paper Total"
                                value={paper.structure.paperTotal || 0}
                                onChange={(e) => handleChange(e)}
                                disabled
                                size='small'
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <div style={{ display: "flex", flexDirection: "row", gap: 2, justifyContent: "end", fontSize: "1.1rem", fontWeight: "600", width: "100%" }}>
                                <Checkbox checked={paper.structure.vat.active} onChange={(e) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.vat.active`, value: e.target.checked } })} />
                                <TextField
                                    sx={{ width: "100px", marginRight: "1rem" }}
                                    label="VAT"
                                    name={`structure.additional[${blockIndex}].structure.vat.value`}
                                    value={paper.structure.vat.value || 0}
                                    onChange={(e) => handleChange(e)}
                                    size='small'
                                    disabled={!paper.structure.vat.active}
                                />
                                <TextField
                                    fullWidth
                                    label="Paper Cost"
                                    value={paper.structure.totalCost || 0}
                                    onChange={(e) => handleChange(e)}
                                    disabled
                                    size='small'
                                />
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
};

export default PaperComponent;