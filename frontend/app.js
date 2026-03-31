const STORAGE_KEY = 'delivery-study-state';

const RESTAURANTS = {
  'pizza-hat': {
    name: 'Pizza Hat',
    cuisine: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    rating: '4.2',
    time: '30-35 mins',
    offer: 'ITEMS\nAT ₹99',
    items: [
      { id: 'ph1', name: 'Margherita Pizza', price: 299, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop' },
      { id: 'ph2', name: 'Pepperoni Pizza', price: 399, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=200&fit=crop' },
      { id: 'ph3', name: 'Garlic Breadsticks', price: 149, image: 'https://images.unsplash.com/photo-1619985632461-f33748ef8f3e?w=200&h=200&fit=crop' },
      { id: 'ph4', name: 'Chocolate Lava Cake', price: 129, image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=200&h=200&fit=crop' },
      { id: 'ph5', name: 'Veggie Supreme Pizza', price: 349, image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=200&h=200&fit=crop' },
      { id: 'ph6', name: 'BBQ Chicken Pizza', price: 429, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop' },
      { id: 'ph7', name: 'Cheese Burst Pizza', price: 459, image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=200&h=200&fit=crop' },
      { id: 'ph8', name: 'Paneer Tikka Pizza', price: 379, image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=200&h=200&fit=crop' },
      { id: 'ph9', name: 'Chicken Wings', price: 199, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=200&h=200&fit=crop' },
      { id: 'ph10', name: 'Cheesy Garlic Bread', price: 169, image: 'https://images.unsplash.com/photo-1573140401552-3fab0b24f2b4?w=200&h=200&fit=crop' },
      { id: 'ph11', name: 'Pasta Alfredo', price: 249, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop' },
      { id: 'ph12', name: 'Caesar Salad', price: 179, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200&h=200&fit=crop' },
      { id: 'ph13', name: 'Brownie with Ice Cream', price: 149, image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=200&h=200&fit=crop' },
      { id: 'ph14', name: 'Tiramisu', price: 159, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop' },
      { id: 'ph15', name: 'Pepsi (500ml)', price: 49, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=200&fit=crop' },
      { id: 'ph16', name: 'Mojito', price: 99, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=200&h=200&fit=crop' }
    ]
  },
  'burger-queen': {
    name: 'Burger Queen',
    cuisine: 'Burgers',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    rating: '4.3',
    time: '30-35 mins',
    offer: 'ITEMS\nAT ₹59',
    items: [
      { id: 'bk1', name: 'Whopper', price: 189, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
      { id: 'bk2', name: 'Chicken Royale', price: 179, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=200&h=200&fit=crop' },
      { id: 'bk3', name: 'French Fries', price: 99, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop' },
      { id: 'bk4', name: 'Chocolate Shake', price: 119, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=200&fit=crop' },
      { id: 'bk5', name: 'Veg Whopper', price: 169, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=200&h=200&fit=crop' },
      { id: 'bk6', name: 'Crispy Chicken Burger', price: 149, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&h=200&fit=crop' },
      { id: 'bk7', name: 'Double Patty Burger', price: 229, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&h=200&fit=crop' },
      { id: 'bk8', name: 'Paneer King Burger', price: 159, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=200&h=200&fit=crop' },
      { id: 'bk9', name: 'Chicken Nuggets', price: 129, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=200&h=200&fit=crop' },
      { id: 'bk10', name: 'Onion Rings', price: 89, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=200&h=200&fit=crop' },
      { id: 'bk11', name: 'Peri Peri Fries', price: 109, image: 'https://images.unsplash.com/photo-1630431341973-02e1d0f45e79?w=200&h=200&fit=crop' },
      { id: 'bk12', name: 'Cheese Fries', price: 119, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=200&h=200&fit=crop' },
      { id: 'bk13', name: 'Vanilla Shake', price: 119, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=200&h=200&fit=crop' },
      { id: 'bk14', name: 'Strawberry Shake', price: 129, image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=200&h=200&fit=crop' },
      { id: 'bk15', name: 'Coca Cola', price: 49, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop' },
      { id: 'bk16', name: 'Ice Cream Sundae', price: 79, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop' }
    ]
  },
  'blues-biryani': {
    name: 'Blues\' Biryani',
    cuisine: 'Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
    rating: '4.3',
    time: '35-40 mins',
    offer: 'ITEMS\nAT ₹99',
    items: [
      { id: 'bb1', name: 'Hyderabadi Biryani', price: 249, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop' },
      { id: 'bb2', name: 'Chicken Biryani', price: 279, image: 'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?w=200&h=200&fit=crop' },
      { id: 'bb3', name: 'Raita', price: 49, image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=200&h=200&fit=crop' },
      { id: 'bb4', name: 'Gulab Jamun', price: 79, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&h=200&fit=crop' },
      { id: 'bb5', name: 'Mutton Biryani', price: 329, image: 'https://images.unsplash.com/photo-1633945274309-c440f8a8dc50?w=200&h=200&fit=crop' },
      { id: 'bb6', name: 'Egg Biryani', price: 199, image: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=200&h=200&fit=crop' },
      { id: 'bb7', name: 'Veg Biryani', price: 219, image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=200&h=200&fit=crop' },
      { id: 'bb8', name: 'Paneer Biryani', price: 239, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200&h=200&fit=crop' },
      { id: 'bb9', name: 'Chicken Kebab', price: 189, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=200&h=200&fit=crop' },
      { id: 'bb10', name: 'Tandoori Chicken', price: 299, image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=200&h=200&fit=crop' },
      { id: 'bb11', name: 'Chicken 65', price: 179, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=200&h=200&fit=crop' },
      { id: 'bb12', name: 'Mirchi Ka Salan', price: 99, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop' },
      { id: 'bb13', name: 'Double Ka Meetha', price: 89, image: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=200&h=200&fit=crop' },
      { id: 'bb14', name: 'Kheer', price: 69, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop' },
      { id: 'bb15', name: 'Lassi', price: 59, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&h=200&fit=crop' },
      { id: 'bb16', name: 'Masala Chaas', price: 49, image: 'https://images.unsplash.com/photo-1628408891486-e3df4d598c7d?w=200&h=200&fit=crop' }
    ]
  },
  'punjab-grills': {
    name: 'Punjab Grills',
    cuisine: 'North Indian',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    rating: '4.2',
    time: '30-35 mins',
    offer: 'ITEMS\nAT ₹125',
    items: [
      { id: 'pg1', name: 'Butter Chicken', price: 329, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&h=200&fit=crop' },
      { id: 'pg2', name: 'Paneer Tikka', price: 269, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&h=200&fit=crop' },
      { id: 'pg3', name: 'Garlic Naan', price: 59, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop' },
      { id: 'pg4', name: 'Lassi', price: 89, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=200&h=200&fit=crop' },
      { id: 'pg5', name: 'Dal Makhani', price: 249, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop' },
      { id: 'pg6', name: 'Palak Paneer', price: 259, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop' },
      { id: 'pg7', name: 'Chicken Tikka Masala', price: 319, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&h=200&fit=crop' },
      { id: 'pg8', name: 'Kadai Paneer', price: 279, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop' },
      { id: 'pg9', name: 'Tandoori Roti', price: 39, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=200&fit=crop' },
      { id: 'pg10', name: 'Butter Naan', price: 49, image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200&h=200&fit=crop' },
      { id: 'pg11', name: 'Chicken Biryani', price: 299, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop' },
      { id: 'pg12', name: 'Veg Pulao', price: 189, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200&h=200&fit=crop' },
      { id: 'pg13', name: 'Raita', price: 59, image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=200&h=200&fit=crop' },
      { id: 'pg14', name: 'Gulab Jamun', price: 79, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&h=200&fit=crop' },
      { id: 'pg15', name: 'Ras Malai', price: 99, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop' },
      { id: 'pg16', name: 'Masala Chai', price: 39, image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&h=200&fit=crop' }
    ]
  },
  'magnolia-bakers': {
    name: 'Magnolia Bakers',
    cuisine: 'Bakery & Desserts',
    image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&h=300&fit=crop',
    rating: '4.5',
    time: '25-30 mins',
    offer: 'ITEMS\nAT ₹79',
    items: [
      { id: 'mb1', name: 'Red Velvet Cupcake', price: 149, image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=200&h=200&fit=crop' },
      { id: 'mb2', name: 'Chocolate Chip Cookies', price: 99, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop' },
      { id: 'mb3', name: 'Banana Pudding', price: 179, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop' },
      { id: 'mb4', name: 'Vanilla Cupcake', price: 129, image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=200&h=200&fit=crop' },
      { id: 'mb5', name: 'Blueberry Muffin', price: 119, image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=200&h=200&fit=crop' },
      { id: 'mb6', name: 'Carrot Cake', price: 189, image: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=200&h=200&fit=crop' },
      { id: 'mb7', name: 'Cheesecake Slice', price: 199, image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=200&h=200&fit=crop' },
      { id: 'mb8', name: 'Chocolate Brownie', price: 139, image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=200&h=200&fit=crop' },
      { id: 'mb9', name: 'Cinnamon Roll', price: 159, image: 'https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?w=200&h=200&fit=crop' },
      { id: 'mb10', name: 'Lemon Tart', price: 169, image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=200&h=200&fit=crop' },
      { id: 'mb11', name: 'Croissant', price: 89, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop' },
      { id: 'mb12', name: 'Apple Pie', price: 179, image: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=200&h=200&fit=crop' },
      { id: 'mb13', name: 'Macarons (6 pcs)', price: 249, image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=200&h=200&fit=crop' },
      { id: 'mb14', name: 'Chocolate Eclair', price: 129, image: 'https://images.unsplash.com/photo-1612201142855-c7a9b5a4e93d?w=200&h=200&fit=crop' },
      { id: 'mb15', name: 'Iced Coffee', price: 119, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=200&h=200&fit=crop' },
      { id: 'mb16', name: 'Hot Chocolate', price: 109, image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=200&h=200&fit=crop' }
    ]
  },
  'chowmans': {
    name: 'Chowman\'s',
    cuisine: 'Chinese',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop',
    rating: '4.1',
    time: '35-40 mins',
    offer: 'ITEMS\nAT ₹149',
    items: [
      { id: 'cm1', name: 'Hakka Noodles', price: 189, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200&h=200&fit=crop' },
      { id: 'cm2', name: 'Chicken Manchurian', price: 249, image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=200&h=200&fit=crop' },
      { id: 'cm3', name: 'Veg Spring Rolls', price: 149, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=200&fit=crop' },
      { id: 'cm4', name: 'Fried Rice', price: 179, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&h=200&fit=crop' },
      { id: 'cm5', name: 'Chilli Chicken', price: 269, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=200&h=200&fit=crop' },
      { id: 'cm6', name: 'Paneer Chilli', price: 239, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&h=200&fit=crop' },
      { id: 'cm7', name: 'Schezwan Noodles', price: 199, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
      { id: 'cm8', name: 'Chicken Fried Rice', price: 219, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=200&h=200&fit=crop' },
      { id: 'cm9', name: 'Veg Manchurian', price: 199, image: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=200&h=200&fit=crop' },
      { id: 'cm10', name: 'Chicken Momos', price: 159, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&h=200&fit=crop' },
      { id: 'cm11', name: 'Veg Momos', price: 139, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&h=200&fit=crop' },
      { id: 'cm12', name: 'Hot & Sour Soup', price: 119, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop' },
      { id: 'cm13', name: 'Sweet Corn Soup', price: 109, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&h=200&fit=crop' },
      { id: 'cm14', name: 'Honey Chilli Potato', price: 179, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=200&h=200&fit=crop' },
      { id: 'cm15', name: 'Chilli Garlic Noodles', price: 209, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
      { id: 'cm16', name: 'Date Pancake', price: 129, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop' }
    ]
  },
  'lovely-icecream': {
    name: 'Lovely Ice-cream',
    cuisine: 'Ice Cream & Desserts',
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop',
    rating: '4.6',
    time: '20-25 mins',
    offer: 'ITEMS\nAT ₹99',
    items: [
      { id: 'li1', name: 'Vanilla Bean Ice Cream', price: 149, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop' },
      { id: 'li2', name: 'Chocolate Fudge', price: 159, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200&h=200&fit=crop' },
      { id: 'li3', name: 'Strawberry Delight', price: 149, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=200&h=200&fit=crop' },
      { id: 'li4', name: 'Mango Sorbet', price: 169, image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=200&h=200&fit=crop' },
      { id: 'li5', name: 'Pistachio Ice Cream', price: 179, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=200&h=200&fit=crop' },
      { id: 'li6', name: 'Salted Caramel', price: 189, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop' },
      { id: 'li7', name: 'Cookie Dough', price: 199, image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&h=200&fit=crop' },
      { id: 'li8', name: 'Mint Chocolate Chip', price: 169, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200&h=200&fit=crop' },
      { id: 'li9', name: 'Belgian Chocolate', price: 209, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200&h=200&fit=crop' },
      { id: 'li10', name: 'Butterscotch', price: 149, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop' },
      { id: 'li11', name: 'Coffee Ice Cream', price: 159, image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&h=200&fit=crop' },
      { id: 'li12', name: 'Blueberry Cheesecake', price: 219, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=200&h=200&fit=crop' },
      { id: 'li13', name: 'Hazelnut Praline', price: 199, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop' },
      { id: 'li14', name: 'Raspberry Ripple', price: 179, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=200&h=200&fit=crop' },
      { id: 'li15', name: 'Ice Cream Sundae', price: 229, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop' },
      { id: 'li16', name: 'Affogato', price: 189, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=200&h=200&fit=crop' }
    ]
  },
  'koris-ramen': {
    name: "Kori's Ramen",
    cuisine: 'Japanese Ramen',
    image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=300&fit=crop',
    rating: '4.4',
    time: '30-35 mins',
    offer: 'ITEMS\nAT ₹199',
    items: [
      { id: 'kr1', name: 'Tonkotsu Ramen', price: 329, image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=200&h=200&fit=crop' },
      { id: 'kr2', name: 'Miso Ramen', price: 299, image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=200&h=200&fit=crop' },
      { id: 'kr3', name: 'Shoyu Ramen', price: 289, image: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=200&h=200&fit=crop' },
      { id: 'kr4', name: 'Spicy Tan Tan Ramen', price: 339, image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200&h=200&fit=crop' },
      { id: 'kr5', name: 'Vegetable Ramen', price: 269, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop' },
      { id: 'kr6', name: 'Chicken Ramen', price: 309, image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200&h=200&fit=crop' },
      { id: 'kr7', name: 'Gyoza (6 pcs)', price: 179, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop' },
      { id: 'kr8', name: 'Edamame', price: 129, image: 'https://images.unsplash.com/photo-1583797227936-e6d2f2c6d7a7?w=200&h=200&fit=crop' },
      { id: 'kr9', name: 'Chicken Karaage', price: 219, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=200&fit=crop' },
      { id: 'kr10', name: 'Takoyaki (6 pcs)', price: 199, image: 'https://images.unsplash.com/photo-1583797227936-e6d2f2c6d7a7?w=200&h=200&fit=crop' },
      { id: 'kr11', name: 'Tempura Udon', price: 279, image: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=200&h=200&fit=crop' },
      { id: 'kr12', name: 'Yakisoba', price: 249, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200&h=200&fit=crop' },
      { id: 'kr13', name: 'Mochi Ice Cream', price: 149, image: 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=200&h=200&fit=crop' },
      { id: 'kr14', name: 'Green Tea Cheesecake', price: 169, image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=200&h=200&fit=crop' },
      { id: 'kr15', name: 'Japanese Iced Tea', price: 89, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=200&fit=crop' },
      { id: 'kr16', name: 'Ramune Soda', price: 79, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=200&fit=crop' }
    ]
  }
};

const MENU_ITEMS = [
  { id: 'm1', name: 'Veg Burger', price: 120 },
  { id: 'm2', name: 'Paneer Wrap', price: 170 },
  { id: 'm3', name: 'Masala Fries', price: 90 },
  { id: 'm4', name: 'Cold Coffee', price: 110 }
];

function getState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return {};
  }
}

function setState(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function money(value) {
  return `₹${value}`;
}

function requireSession() {
  const state = getState();
  if (!state.participantId || !state.experimentId) {
    window.location.href = 'index.html';
    return null;
  }
  return state;
}

const sentExperimentEvents = new Set();

function emitExperimentEvent(eventName, state, source = 'frontend_page') {
  if (!state || !state.participantId || !state.experimentId) {
    return;
  }

  const dedupeKey = [
    eventName,
    state.participantId,
    state.experimentId,
    window.location.pathname
  ].join(':');

  if (sentExperimentEvents.has(dedupeKey)) {
    return;
  }

  sentExperimentEvents.add(dedupeKey);

  void fetch('/api/experiment-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      participantId: state.participantId,
      experimentId: state.experimentId,
      source,
      clientTimestamp: new Date().toISOString(),
      page: document.body.dataset.page || '',
      path: window.location.pathname
    })
  }).catch((error) => {
    console.error(`Failed to emit experiment event ${eventName}`, error);
  });
}

function emitPageOnsetAfterPaint(eventName, state) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      emitExperimentEvent(eventName, state);
    });
  });
}

function pageHome() {
  const form = document.getElementById('session-form');
  if (!form) {
    return;
  }

  const participantInput = document.getElementById('participant-id');
  const experimentInput = document.getElementById('experiment-id');
  
  // Load last participant ID from session storage
  const state = getState();
  console.log('Home page loaded. Stored state:', state);
  
  if (state && state.participantId) {
    console.log('Restoring previous participant ID:', state.participantId);
    participantInput.value = state.participantId;
  } else {
    console.log('No previous participant ID found, using default');
  }
  
  const participantDecrement = document.getElementById('participant-decrement');
  const participantIncrement = document.getElementById('participant-increment');
  const experimentDecrement = document.getElementById('experiment-decrement');
  const experimentIncrement = document.getElementById('experiment-increment');

  // Update suggested experiment ID when participant ID changes
  async function updateSuggestedExperiment() {
    const participantId = participantInput.value.trim();
    
    console.log('updateSuggestedExperiment called with participantId:', participantId);
    
    if (participantId) {
      try {
        // Query the server for the next available experiment ID (globally sequential)
        const response = await fetch(`/api/next-experiment-id?participantId=${encodeURIComponent(participantId)}`);
        const data = await response.json();
        
        console.log('Server response:', { response: response.ok, data });
        
        if (response.ok) {
          console.log('Setting experiment ID to:', data.suggestedExpId);
          experimentInput.value = data.suggestedExpId;
        } else {
          // Fallback to 001 if API fails
          console.log('Server error, using fallback experiment ID: 001');
          experimentInput.value = '001';
        }
      } catch (error) {
        console.error('Failed to fetch next experiment ID:', error);
        // Fallback to 001 if fetch fails
        console.log('Fetch error, using fallback experiment ID: 001');
        experimentInput.value = '001';
      }
    }
  }

  // Helper function to extract number from ID
  function extractNumber(idString) {
    const match = idString.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // Helper function to format participant ID
  function formatParticipantId(num) {
    return `P-${String(num).padStart(3, '0')}`;
  }

  // Helper function to format experiment ID
  function formatExperimentId(num) {
    return String(num).padStart(3, '0');
  }

  // Participant ID increment/decrement handlers
  if (participantIncrement) {
    participantIncrement.addEventListener('click', (e) => {
      e.preventDefault();
      const currentNum = extractNumber(participantInput.value);
      participantInput.value = formatParticipantId(currentNum + 1);
      updateSuggestedExperiment();
    });
  }

  if (participantDecrement) {
    participantDecrement.addEventListener('click', (e) => {
      e.preventDefault();
      const currentNum = extractNumber(participantInput.value);
      if (currentNum > 1) {
        participantInput.value = formatParticipantId(currentNum - 1);
        updateSuggestedExperiment();
      }
    });
  }

  // Experiment ID increment/decrement handlers (globally sequential, no limits)
  if (experimentIncrement) {
    experimentIncrement.addEventListener('click', (e) => {
      e.preventDefault();
      const currentNum = extractNumber(experimentInput.value);
      experimentInput.value = formatExperimentId(currentNum + 1);
    });
  }

  if (experimentDecrement) {
    experimentDecrement.addEventListener('click', (e) => {
      e.preventDefault();
      const currentNum = extractNumber(experimentInput.value);
      if (currentNum > 0) {
        experimentInput.value = formatExperimentId(currentNum - 1);
      }
    });
  }

  // Update on page load to ensure proper initialization
  console.log('Calling updateSuggestedExperiment at page load. Participant ID is:', participantInput.value);
  updateSuggestedExperiment();

  // Listen for changes in participant ID input and update experiment ID suggestion
  participantInput.addEventListener('input', updateSuggestedExperiment);
  participantInput.addEventListener('change', updateSuggestedExperiment);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const participantId = participantInput.value.trim();
    const experimentId = experimentInput.value.trim();
    
    console.log('Form submitted with:', { participantId, experimentId });
    
    if (!participantId || !experimentId) {
      console.log('Form validation failed: missing participantId or experimentId');
      return;
    }

    const state = {
      participantId,
      experimentId,
      cart: {},
      orderStarted: false
    };

    console.log('Saving state to localStorage:', state);
    setState(state);
    window.location.href = 'transition.html';
  });
}

function pageTransition() {
  const state = requireSession();
  if (!state) {
    return;
  }

  const participantInfo = document.getElementById('participant-info');
  if (participantInfo) {
    participantInfo.textContent = `Participant ${state.participantId} Experiment ${state.experimentId}`;
  }

  emitPageOnsetAfterPaint('transition_onset', state);

  setTimeout(() => {
    window.location.href = 'restaurants.html';
  }, 2000);
}

function pageRestaurants() {
  const state = requireSession();
  if (!state) {
    return;
  }

  const restaurantList = document.getElementById('restaurant-list');
  if (!restaurantList) {
    return;
  }

  // Render restaurant cards dynamically
  Object.keys(RESTAURANTS).forEach((restaurantId) => {
    const restaurant = RESTAURANTS[restaurantId];
    
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.setAttribute('data-restaurant-id', restaurantId);
    card.innerHTML = `
      <div class="restaurant-card-image-wrapper">
        <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-card-image" />
        <div class="restaurant-card-badge">ONE</div>
        <div class="restaurant-card-heart">♡</div>
        <div class="restaurant-card-overlay">
          <div class="restaurant-card-offer">${restaurant.offer}</div>
        </div>
      </div>
      <div class="restaurant-card-content">
        <strong>${restaurant.name}</strong>
        <div class="restaurant-card-meta">
          <span class="restaurant-card-rating">${restaurant.rating}</span>
          <span>• ${restaurant.time}</span>
        </div>
        <div class="restaurant-card-cuisine">${restaurant.cuisine}</div>
      </div>
    `;
    
    // Attach click handler
    card.addEventListener('click', () => {
      // Store selectedRestaurant in session state
      state.selectedRestaurant = restaurantId;
      setState(state);
      
      // Navigate to menu.html
      window.location.href = 'menu.html';
    });
    
    restaurantList.appendChild(card);
  });

  emitPageOnsetAfterPaint('restaurants_onset', state);
}

function pageMenu() {
  const state = requireSession();
  if (!state) {
    return;
  }

  // Check for selectedRestaurant in session state
  if (!state.selectedRestaurant) {
    window.location.href = 'restaurants.html';
    return;
  }

  const meta = document.getElementById('session-meta');
  const list = document.getElementById('menu-list');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const placeButton = document.getElementById('place-order');

  // Get restaurant-specific data
  const restaurant = RESTAURANTS[state.selectedRestaurant];
  if (!restaurant) {
    // Invalid restaurant ID, redirect back
    window.location.href = 'restaurants.html';
    return;
  }

  const menuItems = restaurant.items;

  // Update header with restaurant name
  const restaurantNameHeader = document.getElementById('restaurant-name');
  if (restaurantNameHeader) {
    restaurantNameHeader.textContent = restaurant.name;
  }

  meta.textContent = `Participant: ${state.participantId} | Experiment: ${state.experimentId}`;

  function renderMenu() {
    list.innerHTML = '';

    menuItems.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'menu-item';
      
      // Calculate discounted price (for display purposes)
      const originalPrice = Math.round(item.price * 1.2);
      
      row.innerHTML = `
        <div class="menu-item-image-wrapper">
          <img src="${item.image}" alt="${item.name}" class="menu-item-image" />
          <div class="menu-item-veg-badge"></div>
        </div>
        <div class="menu-item-info">
          <div class="menu-item-rating">4.4 <span class="menu-item-rating-count">(33)</span></div>
          <strong>${item.name}</strong>
          <div class="menu-item-price-row">
            <div class="menu-item-price-wrapper">
              <span class="menu-item-price-original">${money(originalPrice)}</span>
              <span class="menu-item-price">${money(item.price)}</span>
            </div>
            <button data-item-id="${item.id}">Add</button>
          </div>
        </div>
      `;
      list.appendChild(row);
    });

    list.querySelectorAll('button[data-item-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const itemId = button.getAttribute('data-item-id');
        state.cart[itemId] = (state.cart[itemId] || 0) + 1;
        setState(state);
        renderCart();
      });
    });
  }

  function renderCart() {
    const entries = Object.entries(state.cart || {});
    const cartSection = document.getElementById('cart-section');
    cartItems.innerHTML = '';

    if (!entries.length) {
      if (cartSection) {
        cartSection.style.display = 'none';
      }
      return;
    }

    if (cartSection) {
      cartSection.style.display = 'block';
    }

    let total = 0;
    let totalItems = 0;
    entries.forEach(([itemId, quantity]) => {
      const item = menuItems.find((m) => m.id === itemId);
      if (!item) {
        return;
      }

      const lineTotal = item.price * quantity;
      total += lineTotal;
      totalItems += quantity;
    });

    // Display simplified cart info with total
    const itemText = totalItems === 1 ? '1 Item added' : `${totalItems} Items added`;
    cartItems.innerHTML = `
      <div class="cart-top-row">
        <span class="cart-item-count">${itemText}</span>
        <span class="cart-order-now-text">ORDER NOW</span>
      </div>
      <div class="cart-divider"></div>
      <div class="cart-total-row">Total: ${money(total)}</div>
    `;
    cartTotal.textContent = money(total);
  }

  placeButton.addEventListener('click', async () => {
    const cart = Object.entries(state.cart || {})
      .map(([itemId, quantity]) => {
        const item = menuItems.find((m) => m.id === itemId);
        if (!item) {
          return null;
        }

        return {
          itemId,
          name: item.name,
          price: item.price,
          quantity
        };
      })
      .filter(Boolean);

    if (!cart.length) {
      alert('Please add at least one item.');
      return;
    }

    placeButton.disabled = true;

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: state.participantId,
          experimentId: state.experimentId,
          // condition: state.condition,
          cart
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to place order');
      }

      state.orderStarted = true;
      setState(state);
      window.location.href = 'delivery.html';
    } catch (error) {
      alert(error.message);
      placeButton.disabled = false;
    }
  });

  // Make entire cart section clickable
  const cartSection = document.getElementById('cart-section');
  if (cartSection) {
    cartSection.style.cursor = 'pointer';
    cartSection.addEventListener('click', () => {
      placeButton.click();
    });
  }

  renderMenu();
  renderCart();
  emitPageOnsetAfterPaint('menu_onset', state);
}

async function loadOrder(participantId, experimentId) {
  const params = new URLSearchParams({ participantId, experimentId });
  const response = await fetch(`/api/order?${params.toString()}`);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || 'Failed to load order');
  }
  return payload;
}

function pageDelivery() {
  const state = requireSession();
  if (!state) {
    return;
  }

  if (!state.orderStarted) {
    window.location.href = 'menu.html';
    return;
  }

  // HD Food Images Collection
  const foodImages = [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=500&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&h=500&fit=crop&q=80'
  ];

  // Rotate background image randomly every 10 seconds
  const deliveryIllustration = document.querySelector('.delivery-illustration');
  if (deliveryIllustration) {
    let currentImageIndex = Math.floor(Math.random() * foodImages.length);
    deliveryIllustration.style.backgroundImage = `url('${foodImages[currentImageIndex]}')`;
    
    setInterval(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * foodImages.length);
      } while (newIndex === currentImageIndex);
      
      currentImageIndex = newIndex;
      deliveryIllustration.style.backgroundImage = `url('${foodImages[currentImageIndex]}')`;
    }, 10000);
  }

  // Set order placed time (8:00)
  const orderPlacedTimeEl = document.getElementById('order-placed-time');
  if (orderPlacedTimeEl) {
    orderPlacedTimeEl.textContent = '8:00';
  }

  // System Clock Setup - starts at 08:00 and ticks every second (displays as HH:SS)
  const systemClockEl = document.getElementById('system-clock');
  let systemClockSeconds = 8 * 3600; // 8 hours in seconds

  function formatTimeHourSecond(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const seconds = totalSeconds % 60;
    return `${String(hours % 24).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function updateSystemClock() {
    if (systemClockEl) {
      systemClockEl.textContent = formatTimeHourSecond(systemClockSeconds);
    }
    systemClockSeconds += 1;
  }

  // Start system clock - ticks every second
  setInterval(updateSystemClock, 1000);
  // Initial display
  if (systemClockEl) {
    systemClockEl.textContent = formatTimeHourSecond(systemClockSeconds);
  }

  const timeline = document.getElementById('timeline');
  const eta = document.getElementById('current-eta');
  const latest = document.getElementById('latest-message');
  const toRating = document.getElementById('to-rating');
  const statusText = document.getElementById('status-text');
  const statusBadge = document.getElementById('status-badge');
  const meta = document.getElementById('tracking-meta');
  const restaurantNameEl = document.getElementById('restaurant-name-delivery');
  const seenMilestones = new Set();

  // Display restaurant name
  if (state.selectedRestaurant && RESTAURANTS[state.selectedRestaurant]) {
    const restaurant = RESTAURANTS[state.selectedRestaurant];
    if (restaurantNameEl) {
      restaurantNameEl.textContent = restaurant.name;
    }
  }

  meta.textContent = `Participant: ${state.participantId} | Experiment: ${state.experimentId}`;
  emitPageOnsetAfterPaint('delivery_onset', state);

  function appendTimeline(text, emittedAt) {
    const li = document.createElement('li');
    const time = new Date(emittedAt).toLocaleTimeString();
    li.textContent = `${time} - ${text}`;
    timeline.appendChild(li);
  }

  function getMilestoneText(phase) {
    if (phase === 'preparing') {
      return 'Order is being prepared';
    }
    if (phase === 'on_the_way') {
      return 'Order is out for delivery';
    }
    if (phase === 'delivered') {
      return 'Order arrived';
    }
    return null;
  }

  function addMilestoneIfNeeded(phase, emittedAt) {
    const milestoneText = getMilestoneText(phase);
    if (!milestoneText || seenMilestones.has(milestoneText)) {
      return;
    }
    seenMilestones.add(milestoneText);
    appendTimeline(milestoneText, emittedAt);
  }

  function applyDeliveredUi(behavior = 'normal') {
    let statusLabel = 'ON TIME';
    let statusClass = 'status-ontime';

    if (behavior === 'faster') {
      statusLabel = 'EARLY';
      statusClass = 'status-early';
    } else if (behavior === 'delay') {
      statusLabel = 'DELAYED';
      statusClass = 'status-delayed';
    }

    if (statusText) {
      statusText.textContent = statusLabel;
    }

    if (statusBadge) {
      statusBadge.classList.remove('status-early', 'status-delayed', 'status-ontime');
      statusBadge.classList.add(statusClass);
      statusBadge.classList.add('blinking');
    }

    if (eta) {
      eta.textContent = '0';
    }

    toRating.classList.remove('hidden');
    toRating.classList.add('visible');
    toRating.disabled = false;
  }

  loadOrder(state.participantId, state.experimentId)
    .then(({ events, order }) => {
      events.forEach((event) => {
        addMilestoneIfNeeded(event.phase, event.emitted_at);
        latest.textContent = event.message;
        // Update ETA display - just show the number
        if (event.eta_min != null) {
          eta.textContent = event.eta_min;
        }
      });

      const deliveredEvent = [...events].reverse().find((event) => event.phase === 'delivered');
      if (deliveredEvent || order.status === 'delivered') {
        applyDeliveredUi(order.eta_behavior || 'normal');
      }
    })
    .catch((error) => {
      latest.textContent = error.message;
    });

  const socket = io();
  socket.emit('join-order', {
    participantId: state.participantId,
    experimentId: state.experimentId
  });

  socket.on('order-update', (event) => {
    if (
      event.participantId !== state.participantId ||
      event.experimentId !== state.experimentId
    ) {
      return;
    }

    latest.textContent = event.message;
    eta.textContent = event.etaMin;
    
    addMilestoneIfNeeded(event.phase, event.emittedAt);
  });

  socket.on('order-delivered', (event) => {
    if (
      event.participantId !== state.participantId ||
      event.experimentId !== state.experimentId
    ) {
      return;
    }

    applyDeliveredUi(event.behavior || 'normal');
  });

  toRating.addEventListener('click', () => {
    window.location.href = 'rating.html';
  });
}

function pageRating() {
  const state = requireSession();
  if (!state) {
    return;
  }

  if (!state.orderStarted) {
    window.location.href = 'menu.html';
    return;
  }

  const meta = document.getElementById('rating-meta');
  const form = document.getElementById('rating-form');
  const result = document.getElementById('rating-result');
  const backHomeIcon = document.getElementById('back-home-icon');
  const ratingOverallInput = document.getElementById('rating-overall');
  const starRatingEl = document.getElementById('star-rating');
  const selectedStarsDisplayEl = document.getElementById('selected-stars');

  meta.textContent = `Participant: ${state.participantId} | Experiment: ${state.experimentId}`;
  emitPageOnsetAfterPaint('rating_onset', state);

  // Star rating handler
  if (starRatingEl) {
    const stars = starRatingEl.querySelectorAll('.star');
    
    stars.forEach((star) => {
      star.addEventListener('click', () => {
        const value = parseInt(star.getAttribute('data-value'), 10);
        ratingOverallInput.value = value;
        
        // Update star display
        stars.forEach((s) => {
          const sValue = parseInt(s.getAttribute('data-value'), 10);
          if (sValue <= value) {
            s.textContent = '★';
            s.style.color = '#FFD700';
          } else {
            s.textContent = '☆';
            s.style.color = '#ccc';
          }
        });
        
        // Update the display text
        if (selectedStarsDisplayEl) {
          selectedStarsDisplayEl.textContent = `${value} star${value !== 1 ? 's' : ''} selected`;
        }
      });

      // Hover effect
      star.addEventListener('mouseenter', () => {
        const value = parseInt(star.getAttribute('data-value'), 10);
        stars.forEach((s) => {
          const sValue = parseInt(s.getAttribute('data-value'), 10);
          if (sValue <= value) {
            s.textContent = '★';
            s.style.opacity = '0.7';
          } else {
            s.textContent = '☆';
            s.style.opacity = '1';
          }
        });
      });
    });

    starRatingEl.addEventListener('mouseleave', () => {
      const selectedValue = ratingOverallInput.value;
      stars.forEach((s) => {
        s.style.opacity = '1';
        if (selectedValue) {
          const sValue = parseInt(s.getAttribute('data-value'), 10);
          if (sValue <= selectedValue) {
            s.textContent = '★';
            s.style.color = '#FFD700';
          } else {
            s.textContent = '☆';
            s.style.color = '#ccc';
          }
        }
      });
    });
  }

  backHomeIcon.addEventListener('click', () => {
    // Reset session but preserve participantId for next experiment
    const currentState = getState();
    const newState = {
      participantId: currentState.participantId || 'P-001',
      experimentId: '',
      cart: {},
      orderStarted: false
    };
    setState(newState);
    console.log('Session reset. Preserved participant ID:', newState.participantId);
    window.location.href = 'index.html';
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      participantId: state.participantId,
      experimentId: state.experimentId,
      overall: Number(document.getElementById('rating-overall').value),
      trust: document.getElementById('rating-trust')?.value || null,
      fairness: document.getElementById('rating-fairness')?.value || null,
      comments: document.getElementById('rating-comments').value
    };

    try {
      const response = await fetch('/api/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating');
      }

      result.textContent = 'Rating submitted. Session complete.';
      result.className = 'success';
      backHomeIcon.classList.remove('hidden');
    } catch (error) {
      result.textContent = error.message;
      result.className = '';
      backHomeIcon.classList.add('hidden');
    }
  });
}

const page = document.body.dataset.page;

if (page === 'home') {
  pageHome();
} else if (page === 'transition') {
  pageTransition();
} else if (page === 'restaurants') {
  pageRestaurants();
} else if (page === 'menu') {
  pageMenu();
} else if (page === 'delivery') {
  pageDelivery();
} else if (page === 'rating') {
  pageRating();
}
