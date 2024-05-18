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
import { Material, Supplier } from '@prisma/client';
import { useDebounce } from '../../../../../../lib/use-debounce';

const PaperComponent = ({ paper, input, handleChange, initialValues }: { paper: any, input: any, handleChange: any, initialValues?: any }) => {
    const [materials, setMaterials] = React.useState<Partial<Material & { supplier: Partial<Supplier> }>[]>([]);
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
    }, [sheetsQuantity, paper.structure.destroyRate, paper.structure.material.id]);

    React.useEffect(() => {
        function calculatePaperCost() {
            const paperTotal = +paper.structure.paperTotal || 0;
            const material = materials?.find((material) => material.id === paper.structure.material.id);
            const selectedVariant = material?.variants?.find((variant: any) => variant.thickness === paper.structure.material.thickness && variant.size === paper.structure.material.size);
            const unitPrice = (selectedVariant as any)?.unitPrice || 0;
            const totalCost = paperTotal * +unitPrice;
            const vat = paper.structure.vat.active ? +paper.structure.vat.value : 0;
            const totalCostWithVat = totalCost + (totalCost * vat / 100);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.totalCost`, value: totalCostWithVat } });
        }
        calculatePaperCost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetsQuantity, paper.structure.destroyRate, paper.structure.material.id, paper.structure.vat.active, paper.structure.vat.value, materials, paper.structure.paperTotal, paper.structure.material.thickness, paper.structure.material.size, paper.structure.piecesInPackage]);

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

    React.useEffect(() => {
        function updatepiecesInPackage() {
            const piecesInPackage = (materials?.find((material) => material.id === paper.structure.material.id)?.variants as any)?.find((variant: any) => variant.thickness === paper.structure.material.thickness && variant.size === paper.structure.material.size)?.piecesInPackage || 0;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material.piecesInPackage`, value: piecesInPackage } });
        }
        updatepiecesInPackage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paper.structure.material.thickness, paper.structure.material.size, materials]);

    React.useEffect(() => {
        function updateUnitPrice() {
            const unitPrice = (materials?.find((material) => material.id === paper.structure.material.id && material.variants?.find((variant: any) => variant.thickness === paper.structure.thickness && variant.size === paper.structure.size)) as any)?.unitPrice || 0;
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material.unitPrice`, value: unitPrice } });
        }
        updateUnitPrice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paper.structure.material.thickness, paper.structure.material.size, paper.structure.material.piecesInPackage, materials]);

    React.useEffect(() => {
        function updateMaterialId() {
            const material = materials?.find((material) => material.name === paper.structure.material.name && material.supplierId === paper.structure.material.supplierId);
            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material.id`, value: material?.id } });
        }
        updateMaterialId();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paper.structure.material.name, paper.structure.material.supplierId, materials]);
    return (
        <Grid item xs={12}>
            <Grid container spacing={2}>
                <Grid item xs={1.5}>
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
                <Grid item xs={1.5}>
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
                <Grid item xs={1.5}>
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
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        label="Destroy Rate"
                        name={`structure.additional[${blockIndex}].structure.destroyRate`}
                        value={paper.structure.destroyRate || 0}
                        onChange={(e) => handleChange(e)}
                        size='small'
                    />
                </Grid>
                <Grid item xs={3}>
                    <Autocomplete
                        fullWidth
                        options={materials ? materials.map((material) => material.name).filter((value, index, self) => self.indexOf(value) === index) : []}
                        getOptionLabel={(option) => option ? option : ""}
                        renderOption={(props, option) => (
                            materialsLoading ? <ListItem key={uuidv4()}>Loading...</ListItem> : <ListItem {...props} key={option}> <ListItemText primary={`${option}`} /> </ListItem>
                        )}
                        loading={materialsLoading}
                        loadingText="Loading..."
                        value={materials?.find((material) => material.id === paper.structure.material.id)?.name || ""}
                        renderInput={(params) => <TextField {...params} label="Material" />}
                        onChange={(event, value) => {
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material.name`, value: value ? value : null } });
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material.materialCategory`, value: value ? value : null } });
                            handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material.materialType`, value: value ? value : null } });
                        }
                        }
                        onInputChange={(event, value) => {
                            setMaterialSearch(value);
                        }}
                        isOptionEqualToValue={(option, value) => option === value}
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        size='small'
                    />
                </Grid>
                <Grid item xs={1.5}>
                    <FormControl fullWidth size='small'>
                        <InputLabel id="supplierId">Supplier</InputLabel>
                        <Select
                            labelId="supplierId"
                            id="supplierId"
                            label="supplierId"
                            size='small'
                            name="supplierId"
                            value={paper.structure.material.supplierId || ""}
                            onChange={(e: SelectChangeEvent) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material.supplierId`, value: e.target.value } })}
                        >
                            {materials?.filter((material) => material.name === paper.structure.material.name)?.map((material) => material.supplier)?.filter((value, index, self) => self.indexOf(value) === index)?.map((supplier) => (
                                <MenuItem key={supplier?.id} value={supplier?.id}>{supplier?.companyName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        label="Type"
                        value={materials?.find((material) => material.id === paper.structure.material.id)?.type || ""}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
                </Grid>
                <Grid item xs={1.5}>
                    <FormControl fullWidth size='small'>
                        <InputLabel id="thickness">Thickness</InputLabel>
                        <Select
                            labelId="thickness"
                            id="thickness"
                            label="Thickness"
                            size='small'
                            name="thickness"
                            value={paper.structure.material.thickness || ""}
                            onChange={(e: SelectChangeEvent) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material.thickness`, value: e.target.value } })}
                        >
                            {(materials?.find((material) => material.id === paper.structure.material.id)?.variants as any)?.map((variant: any) => variant.thickness).filter((value: any, index: any, self: any) => self.indexOf(value) === index).map((thickness: any) => (
                                <MenuItem key={thickness} value={thickness}>{thickness}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={1.5}>
                    <FormControl fullWidth size='small'>
                        <InputLabel id="size">Size</InputLabel>
                        <Select
                            labelId="size"
                            id="size"
                            label="Size"
                            size='small'
                            name="size"
                            value={paper.structure.material.size || ""}
                            onChange={(e: SelectChangeEvent) => handleChange({ target: { name: `structure.additional[${blockIndex}].structure.material.size`, value: e.target.value } })}
                        >
                            {(materials?.find((material) => material.id === paper.structure.material.id)?.variants as any)?.filter((variant: any) => variant.thickness === paper.structure.material.thickness).map((variant: any) => variant.size).filter((value: any, index: any, self: any) => self.indexOf(value) === index).map((size: any) => (
                                <MenuItem key={size} value={size}>{size}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        label="Peices in Package"
                        value={(materials?.find((material) => material.id === paper.structure.material.id)?.variants as any)?.find((variant: any) => variant.thickness === paper.structure.material.thickness && variant.size === paper.structure.material.size)?.piecesInPackage || 0}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
                </Grid>
                <Grid item xs={1.5}>
                    <TextField
                        fullWidth
                        label="Unit Price"
                        value={(materials?.find((material) => material.id === paper.structure.material.id)?.variants as any)?.find((variant: any) => variant.thickness === paper.structure.material.thickness && variant.size === paper.structure.material.size)?.unitPrice || 0}
                        onChange={(e) => handleChange(e)}
                        disabled
                        size='small'
                    />
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