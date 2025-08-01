import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import {
    AccountBalance as BalanceIcon,
    Input as IncomesIcon,
    Output as ShipmentsIcon,
    People as ClientsIcon,
    Straighten as UnitsIcon,
    Inventory as ResourcesIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const menuItems = [
    { text: "Баланс", icon: <BalanceIcon />, path: "/balance" },
    { text: "Поступления", icon: <IncomesIcon />, path: "/incomes" },
    { text: "Отгрузки", icon: <ShipmentsIcon />, path: "/shipments" },
    { text: "Клиенты", icon: <ClientsIcon />, path: "/clients" },
    { text: "Единицы измерения", icon: <UnitsIcon />, path: "/units" },
    { text: "Ресурсы", icon: <ResourcesIcon />, path: "/resources" },
];

const Sidebar = () => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" },
            }}
        >
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton component={Link} to={item.path}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;