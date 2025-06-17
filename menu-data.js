// Dane menu restauracji
const menuData = {
    "napoje_gorace": {
        name: "Napoje Gorące",
        items: [
            {
                id: "coffee_latte_m",
                name: "Caffe Latte M",
                description: "Klasyczne latte z mlekiem",
                price: 12.90
            },
            {
                id: "espresso",
                name: "Espresso",
                description: "Klasyczne espresso",
                price: 9.00
            },
            {
                id: "cappuccino",
                name: "Cappuccino",
                description: "Cappuccino z pianką mleczną",
                price: 11.50
            },
            {
                id: "americano",
                name: "Americano",
                description: "Espresso z gorącą wodą",
                price: 10.00
            },
            {
                id: "herbata",
                name: "Herbata czarna",
                description: "Klasyczna herbata czarna",
                price: 8.00
            }
        ]
    },
    "napoje_zimne": {
        name: "Napoje Zimne",
        items: [
            {
                id: "cola",
                name: "Coca-Cola",
                description: "Klasyczna Coca-Cola 0.33L",
                price: 7.50
            },
            {
                id: "sprite",
                name: "Sprite",
                description: "Sprite 0.33L",
                price: 7.50
            },
            {
                id: "sok_pomaranczowy",
                name: "Sok pomarańczowy",
                description: "Świeży sok pomarańczowy 0.25L",
                price: 9.00
            },
            {
                id: "woda",
                name: "Woda mineralna",
                description: "Woda niegazowana 0.5L",
                price: 5.00
            }
        ]
    },
    "dania_glowne": {
        name: "Dania Główne",
        items: [
            {
                id: "pizza_margherita",
                name: "Pizza Margherita",
                description: "Sos pomidorowy, mozzarella, bazylia",
                price: 28.00
            },
            {
                id: "pizza_pepperoni",
                name: "Pizza Pepperoni",
                description: "Sos pomidorowy, mozzarella, pepperoni",
                price: 32.00
            },
            {
                id: "burger_klasyczny",
                name: "Burger Klasyczny",
                description: "Wołowina, sałata, pomidor, cebula, sos",
                price: 25.00
            },
            {
                id: "spaghetti_carbonara",
                name: "Spaghetti Carbonara",
                description: "Makaron z boczkiem i śmietaną",
                price: 22.00
            },
            {
                id: "kotlet_schabowy",
                name: "Kotlet Schabowy",
                description: "Tradycyjny kotlet z ziemniakami",
                price: 26.00
            }
        ]
    },
    "desery": {
        name: "Desery",
        items: [
            {
                id: "tiramisu",
                name: "Tiramisu",
                description: "Klasyczne tiramisu",
                price: 15.00
            },
            {
                id: "sernik",
                name: "Sernik",
                description: "Domowy sernik z owocami",
                price: 12.00
            },
            {
                id: "lody",
                name: "Lody waniliowe",
                description: "3 gałki lodów waniliowych",
                price: 10.00
            }
        ]
    }
};
