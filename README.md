# gravity
 
Gravity simulation following Newton's equation for universal gravitation: $F = G {m_1 m_2 \over r^2}$.

By default, the simulation loads an inital state with some planets orbiting a star, stored as `system.json`. New bodys can be added by holding LMB and dragging to the opposite direction you want the body to be moving to, with the amount of force applied depending on the dragged distance multiplied by a factor that can be modified on the options panel. The size, density and color of new bodies can also be changed.

The page needs to be served by a web server to access the `system.json` file and, therefore, to work properly. For VS Code, an extension like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) will do the trick.
