"use client"

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Form from './components/form';

import Button from '@mui/material/Button';
import { CREATE, DELETE, UPDATE } from '../../../../../actions/material';
import { Supplier, Material, User } from '@prisma/client';
import Skeleton from '@mui/material/Skeleton';

import { useDebounce } from "@/lib/use-debounce";
import DeleteBTN from './components/delete';

interface MaterialWithUserAndSupplier extends Partial<Material> {
    user: Partial<User>;
    supplier: Partial<Supplier>;
}

type Order = 'asc' | 'desc';


interface HeadCell {
    id: string;
    label: string;
}


const headCells: readonly HeadCell[] = [
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
    { id: 'type', label: 'Type' },
    { id: 'thickness', label: 'Thickness' },
    { id: 'size', label: 'Size' },
    { id: 'unit', label: 'Unit' },
    { id: 'piecesInPackage', label: 'Pieces in Package' },
    { id: 'packagePrice', label: 'Package Price' },
    { id: 'unitPrice', label: 'Unit Price' },
    { id: 'description', label: 'Description' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'actions', label: '' },
];

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
    height: 40,
}));


const StyledTableSortLabel = styled(TableSortLabel)(({ theme }) => ({
    '&.MuiTableSortLabel-root': {
        color: 'white',
    },
    '&.MuiTableSortLabel-active': {
        color: 'white',
    },
    '&.MuiTableSortLabel-icon': {
        color: 'white',
    },
}));

export default function CustomizedTables() {
    const [page, setPage] = React.useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);
    const [search, setSearch] = React.useState<string>("");
    const [rows, setRows] = React.useState<MaterialWithUserAndSupplier[] | []>([]);
    const [open, setOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(true);
    const [order, setOrder] = React.useState<Order>('desc');
    const [orderBy, setOrderBy] = React.useState<keyof MaterialWithUserAndSupplier>('createdAt');

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof MaterialWithUserAndSupplier,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedId("");
    };

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'n') {
                handleClickOpen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const debouncedSearch = useDebounce(search, 500);

    React.useEffect(() => {
        const fetchInputs = async () => {
            setLoading(true);

            const response = await fetch(`/api/data/material?filterByName=${debouncedSearch}&page=${page + 1}&limit=${rowsPerPage}&sorting=${orderBy}&order=${order}`);

            if (response.ok) {
                const data = await response.json();
                setRows(data.materials);
            }

            setLoading(false);
        }

        fetchInputs();
    }, [debouncedSearch, page, rowsPerPage, orderBy, order]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearch = (searchedVal: string) => {
        setSearch(searchedVal);
    };

    const handleDelete = async (id: string) => {
        await DELETE(id).then((res) => {
            const updatedRows = rows.filter((row) => row.id !== res);
            setRows(updatedRows as MaterialWithUserAndSupplier[]);
        }).catch((err) => {
            console.log(err);
        });
    };

    const handleCreate = async (data: any) => {
        try {
            await CREATE(data).then((res) => {
                setRows([res as MaterialWithUserAndSupplier, ...rows]);
                handleClose();
            }).catch((err) => {
                console.log(err);
            });
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdate = async (data: any) => {
        await UPDATE(data).then((res) => {
            const updatedRows = rows.map((row) => {
                if (row.id === res.id) {
                    return res;
                }
                return row;
            });
            setRows(updatedRows as MaterialWithUserAndSupplier[]);
            handleClose();
        }).catch((err) => {
            console.log(err);
        });
    };

    const handleEdit = (id: string) => {
        setSelectedId(id);
        handleClickOpen();
    };

    return (
        <Box
            component="div"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'end',
                width: '100%',
                gap: 3,
            }}
        >
            <Form onClose={handleClose} open={open} onSubmit={selectedId ? handleUpdate : handleCreate} initialValues={selectedId ? rows.find((row) => row.id === selectedId) : null} />
            <Box
                component="div"
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'end',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1,
                }}
            >
                <TextField placeholder="Search" variant="outlined" value={search} onChange={(e) => { handleSearch(e.target.value) }} sx={{
                    [`& input`]: {
                        height: "37px",
                        padding: "0 14px",
                    },
                }}
                />
                <Button variant="contained" sx={{ textWrap: "nowrap" }} onClick={handleClickOpen}>
                    Add Material [N]
                </Button>
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table" size={'small'}>
                    <TableHead>
                        <TableRow>
                            {headCells.map((headCell) => (
                                <StyledTableCell
                                    key={headCell.id}
                                    align={headCell.id === 'peices' || headCell.id === 'createdAt' ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    {headCell.id === 'name' || headCell.id === 'code' || headCell.id === 'createdAt' ? (
                                        <StyledTableSortLabel
                                            sx={{ "&.MuiTableSortLabel-root": { color: "white" }, "&.MuiTableSortLabel-active": { color: "white" }, "&.MuiTableSortLabel-icon": { color: "white" }, "&.MuiTableSortLabel-iconDirectionDesc": { color: "white" }, "&.MuiTableSortLabel-iconDirectionAsc": { color: "white" } }}
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={(event) => handleRequestSort(event, headCell.id as keyof MaterialWithUserAndSupplier)}
                                            disabled={loading}
                                        >
                                            {headCell.label}
                                        </StyledTableSortLabel>
                                    ) : (
                                        headCell.label
                                    )}
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <StyledTableRow>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Skeleton variant="text" height={35} />
                                </StyledTableCell>
                                <StyledTableCell sx={{ display: 'flex', gap: 2, flexDirection: "row", justifyContent: "end", alignItems: "center" }}>
                                    <Skeleton variant="circular" width={35} height={35} />
                                    <Skeleton variant="circular" width={35} height={35} />
                                </StyledTableCell>
                            </StyledTableRow>
                        ) : (rows.length === 0 ?
                            <StyledTableRow>
                                <StyledTableCell colSpan={11} align="center">No data found</StyledTableCell>
                            </StyledTableRow>
                            :
                            rows.map((row) => (
                                <StyledTableRow key={row.id}>
                                    <StyledTableCell component="th" scope="row">
                                        {row.name}
                                    </StyledTableCell>
                                    <StyledTableCell>{row.category}</StyledTableCell>
                                    <StyledTableCell>{row.type}</StyledTableCell>
                                    <StyledTableCell>{row.thickness}</StyledTableCell>
                                    <StyledTableCell>{row.size}</StyledTableCell>
                                    <StyledTableCell>{row.unit}</StyledTableCell>
                                    <StyledTableCell>{row.piecesInPackage}</StyledTableCell>
                                    <StyledTableCell>{row.packagePrice}</StyledTableCell>
                                    <StyledTableCell>{row.unitPrice}</StyledTableCell>
                                    <StyledTableCell>{row.description}</StyledTableCell>
                                    <StyledTableCell>{row.supplier.companyName} - {row.supplier.managerName}</StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: "row", justifyContent: "end", alignItems: "center" }}>
                                            <IconButton aria-label="edit" sx={{ color: "success.main", p: 0 }} onClick={() => handleEdit(row.id!)}>
                                                <EditRoundedIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <DeleteBTN onAgree={() => handleDelete(row.id!)} />
                                        </Box>
                                    </StyledTableCell>
                                </StyledTableRow>
                            )))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
}
