// Level definitions. Each build() just creates objects with the same classes the
// original sketch used; BaseClass registers them with the game automatically.
// Ground top is y=390, the platform top is y=220 and the sling anchor is (200,50).
var LEVELS = [
    {
        name: "Getting Started",
        birds: 5,
        par: 3,
        hint: "Drag the bird back, then let go to fling it at the pigs!",
        build: function () {
            // The original layout from the first version of the project.
            box1 = new Box(700,320,70,70);
            box2 = new Box(920,320,70,70);
            pig1 = new Pig(810, 350);
            log1 = new Log(810,260,300, PI/2);

            box3 = new Box(700,240,70,70);
            box4 = new Box(920,240,70,70);
            pig3 = new Pig(810, 220);

            log3 =  new Log(810,180,300, PI/2);

            box5 = new Box(810,160,70,70);
            log4 = new Log(760,120,150, PI/7);
            log5 = new Log(870,120,150, -PI/7);

            //log6 = new Log(230,180,80, PI/2);
        }
    },
    {
        name: "Twin Towers",
        birds: 4,
        par: 3,
        build: function () {
            new Box(650, 350, 70, 70);
            new Box(650, 278, 70, 70);
            new Pig(650, 212);

            new Box(870, 350, 70, 70);
            new Box(870, 278, 70, 70);
            new Pig(870, 212);

            new Pig(760, 365);
        }
    },
    {
        name: "Shelter",
        birds: 4,
        par: 3,
        build: function () {
            new Log(710, 313, 150, 0);
            new Log(890, 313, 150, 0);
            new Log(800, 227, 220, PI/2);
            new Pig(800, 365);

            new Box(800, 182, 70, 70);
            new Pig(800, 120);

            new Box(1050, 350, 70, 70);
            new Pig(1050, 290);
        }
    },
    {
        name: "Pyramid",
        birds: 5,
        par: 4,
        build: function () {
            new Box(700, 350, 70, 70);
            new Box(775, 350, 70, 70);
            new Box(850, 350, 70, 70);
            new Box(737, 278, 70, 70);
            new Box(812, 278, 70, 70);
            new Box(775, 206, 70, 70);
            new Pig(775, 142);

            new Pig(620, 365);
            new Pig(940, 365);
        }
    },
    {
        name: "Skyline",
        birds: 6,
        par: 5,
        build: function () {
            new Box(700, 350, 70, 70);
            new Pig(700, 290);

            new Box(800, 350, 70, 70);
            new Box(800, 278, 70, 70);
            new Pig(800, 212);

            new Box(900, 350, 70, 70);
            new Box(900, 278, 70, 70);
            new Box(900, 206, 70, 70);
            new Pig(900, 142);

            new Log(1010, 310, 160, 0);
            new Log(1100, 310, 160, 0);
            new Log(1055, 220, 120, PI/2);
            new Pig(1055, 365);
        }
    },
    {
        name: "The Castle",
        birds: 6,
        par: 5,
        build: function () {
            new Box(720, 350, 70, 70);
            new Box(720, 278, 70, 70);
            new Box(720, 206, 70, 70);
            new Box(960, 350, 70, 70);
            new Box(960, 278, 70, 70);
            new Box(960, 206, 70, 70);
            new Log(840, 162, 300, PI/2);

            new Pig(840, 345, 90);
            new Pig(760, 125);
            new Pig(920, 125);

            new Log(1100, 330, 100, PI/7);
        }
    }
];
