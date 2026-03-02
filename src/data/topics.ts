export interface TopicCode {
    c: string;
    cpp: string;
}

export interface TopicData {
    id: string; // The key like "flowcharts"
    title: string;
    explanation: string;
    tldr: string;
    syntax?: TopicCode;
    example?: TopicCode;
}

export const topicsData: Record<string, Omit<TopicData, 'id'>> = {
    flowcharts: {
        title: "Flowcharts & Algorithms",
        explanation:
            "An algorithm is a step-by-step procedure for solving a problem, while a flowchart is a graphical representation of that algorithm. They are crucial for planning your program's logic before writing any code.<br><br>... (Truncated for brevity, but full content will be added in production)",
        tldr: "Plan your logic with algorithms (steps) and flowcharts (diagrams) before you code.",
    },
    variables: {
        title: "Variables & Data Types",
        explanation:
            "Variables are containers for storing data values. Each variable has a data type, which specifies the type of data it can hold, such as integers (int), floating-point numbers (float), and characters (char).",
        syntax: {
            c: "type variable_name = value;",
            cpp: "type variable_name = value;",
        },
        example: {
            c: '#include <stdio.h>\n\nint main() {\n    int age = 25;\n    float pi = 3.14;\n    char initial = \'J\';\n    printf("Age: %d, Pi: %f, Initial: %c\\n", age, pi, initial);\n    return 0;\n}',
            cpp: '#include <iostream>\n\nint main() {\n    int age = 25;\n    float pi = 3.14;\n    char initial = \'J\';\n    std::cout << "Age: " << age << ", Pi: " << pi << ", Initial: " << initial << std::endl;\n    return 0;\n}',
        },
        tldr: "Variables store data. You must declare their type (e.g., int, float, char) before use.<br>Use meaningful names and initialize them.",
    },
    Operator: {
        title: "Operators",
        explanation:
            "Operators are symbols that perform operations on variables and values. They can be categorized into several types... Arithmetic, Relational, Logical, Assignment, Bitwise, Miscellaneous.",
        syntax: {
            c: "int a = 10 + 5; // Arithmetic\nif (a > 10 && a < 20) { ... } // Relational and Logical\nint b = a; // Assignment\nint size = sizeof(a); // Miscellaneous",
            cpp: "int a = 10 + 5; // Arithmetic\nif (a > 10 && a < 20) { ... } // Relational and Logical\nint b = a; // Assignment\nint size = sizeof(a); // Miscellaneous",
        },
        tldr: "Operators perform operations on data. Key types: Arithmetic (+, -, *), Relational (==, !=), Logical (&&, ||), Assignment (=, +=), Bitwise (&, |), Miscellaneous (sizeof, ?:). Understand precedence for correct evaluation.",
    },
    ControlFlow: {
        title: "Control Flow",
        explanation:
            "Control flow statements determine the order in which code is executed based on conditions. The main types are 'if', 'else if', 'else', and 'switch'.",
        syntax: {
            c: "if (condition) { ... } else if (condition) { ... } else { ... }\nswitch (variable) { case value1: ... break; case value2: ... break; default: ... }",
            cpp: "if (condition) { ... } else if (condition) { ... } else { ... }\nswitch (variable) { case value1: ... break; case value2: ... break; default: ... }",
        },
        tldr: "Use 'if', 'else if', 'else' for conditional execution. Use 'switch' for multi-way branching based on variable values.",
    },
    loops: {
        title: "Loops",
        explanation:
            "Loops are used to execute a block of code repeatedly. The main types are 'for', 'while', and 'do-while'.",
        syntax: {
            c: "for (initialization; condition; increment) { ... }\nwhile (condition) { ... }\ndo { ... } while (condition);",
            cpp: "for (initialization; condition; increment) { ... }\nwhile (condition) { ... }\ndo { ... } while (condition);",
        },
        example: {
            c: '#include <stdio.h>\n\nint main() {\n    // Print numbers from 1 to 5\n    for (int i = 1; i <= 5; ++i) {\n        printf("%d\\n", i);\n    }\n    return 0;\n}',
            cpp: '#include <iostream>\n\nint main() {\n    // Print numbers from 1 to 5\n    for (int i = 1; i <= 5; ++i) {\n        std::cout << i << std::endl;\n    }\n    return 0;\n}',
        },
        tldr: "Use 'for' when you know the number of iterations. Use 'while' for looping as long as a condition is true.",
    },
    Arrays: {
        title: "Arrays",
        explanation:
            "Arrays are collections of elements of the same data type, stored in contiguous memory locations. They allow you to store multiple values in a single variable and access them using an index.",
        syntax: {
            c: "type array_name[size] = {value1, value2, ...};",
            cpp: "type array_name[size] = {value1, value2, ...};",
        },
        example: {
            c: '#include <stdio.h>\n\nint main() {\n    int numbers[5] = {1, 2, 3, 4, 5};\n    int sum = 0;\n    for (int i = 0; i < 5; i++) {\n        sum += numbers[i];\n    }\n    printf("Sum: %d\\n", sum);\n    return 0;\n}',
            cpp: '#include <iostream>\n\nint main() {\n    int numbers[5] = {1, 2, 3, 4, 5};\n    int sum = 0;\n    for (int i = 0; i < 5; i++) {\n        sum += numbers[i];\n    }\n    std::cout << "Sum: " << sum << std::endl;\n    return 0;\n}',
        },
        tldr: "Arrays store multiple values of the same type. Declare with type and size, access with indices starting at 0.",
    },
    functions: {
        title: "Functions",
        explanation:
            "Functions are blocks of code that perform a specific task. They are used to break down large problems into smaller, manageable pieces.",
        syntax: {
            c: "return_type function_name(parameter_type parameter_name, ...);",
            cpp: "return_type function_name(parameter_type parameter_name, ...);",
        },
        example: {
            c: '#include <stdio.h>\n\n// Function to add two numbers\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int result = add(5, 3);\n    printf("Result: %d\\n", result);\n    return 0;\n}',
            cpp: '#include <iostream>\n\n// Function to add two numbers\nint add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int result = add(5, 3);\n    std::cout << "Result: " << result << std::endl;\n    return 0;\n}',
        },
        tldr: "Functions help organize code, make it reusable, and improve readability. Define once, use many times.",
    },
    strings: {
        title: "Strings",
        explanation:
            "In C, strings are arrays of characters ending with a null character '\\0'. C++ provides a more convenient `std::string` class.",
        syntax: {
            c: "char str_name[size];",
            cpp: "#include <string>\nstd::string str_name;",
        },
        example: {
            c: '#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char greeting[20] = "Hello, C!";\n    printf("%s\\n", greeting);\n    printf("Length: %zu\\n", strlen(greeting));\n    return 0;\n}',
            cpp: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string greeting = "Hello, C++!";\n    std::cout << greeting << std::endl;\n    std::cout << "Length: " << greeting.length() << std::endl;\n    return 0;\n}',
        },
        tldr: "C strings are null-terminated char arrays. C++ `std::string` is safer and easier to use.",
    },
    Pointers: {
        title: "Pointers",
        explanation:
            "Pointers are variables that store the memory address of another variable. They are powerful tools in C and C++ for dynamic memory management, array manipulation, and efficient data handling.",
        syntax: {
            c: "type *pointer_name;\npointer_name = &variable_name;\n*pointer_name;",
            cpp: "type *pointer_name;\npointer_name = &variable_name;\n*pointer_name;",
        },
        example: {
            c: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(&x, &y);\n    printf("x: %d, y: %d\\n", x, y);\n    return 0;\n}',
            cpp: '#include <iostream>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    swap(&x, &y);\n    std::cout << "x: " << x << ", y: " << y << std::endl;\n    return 0;\n}',
        },
        tldr: "Pointers store memory addresses. Use '&' to get an address, '*' to access the value at that address.",
    },
    structures: {
        title: "Structures",
        explanation:
            "Structures (structs) are user-defined data types that group related variables of different types under a single name.",
        syntax: {
            c: "struct StructName { data_type member1; data_type member2; ... };\nstruct StructName instance_name;",
            cpp: "struct StructName { data_type member1; data_type member2; ... };\nStructName instance_name;",
        },
        example: {
            c: '#include <stdio.h>\n#include <string.h>\n\nstruct Person {\n    char name[50];\n    int age;\n};\n\nint main() {\n    struct Person person1;\n    strcpy(person1.name, "Alice");\n    person1.age = 30;\n    printf("Name: %s, Age: %d\\n", person1.name, person1.age);\n    return 0;\n}',
            cpp: '#include <iostream>\n#include <string>\n\nstruct Person {\n    std::string name;\n    int age;\n};\n\nint main() {\n    Person person1;\n    person1.name = "Alice";\n    person1.age = 30;\n    std::cout << "Name: " << person1.name << ", Age: " << person1.age << std::endl;\n    return 0;\n}',
        },
        tldr: "Structures group related variables. Define with 'struct', access members with dot operator.",
    },
    Recursion: {
        title: "Recursion",
        explanation:
            "Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem.",
        syntax: {
            c: "return_type function_name(parameters) {\n    if (base_case_condition) {\n        return base_case_value;\n    }\n    return function_name(modified_parameters);\n}",
            cpp: "return_type function_name(parameters) {\n    if (base_case_condition) {\n        return base_case_value;\n    }\n    return function_name(modified_parameters);\n}",
        },
        example: {
            c: '#include <stdio.h>\n\nint factorial(int n) {\n    if (n <= 1) return 1; // Base case\n    return n * factorial(n - 1); // Recursive case\n}\n\nint main() {\n    int num = 5;\n    printf("Factorial of %d is %d\\n", num, factorial(num));\n    return 0;\n}',
            cpp: '#include <iostream>\n\nint factorial(int n) {\n    if (n <= 1) return 1; // Base case\n    return n * factorial(n - 1); // Recursive case\n}\n\nint main() {\n    int num = 5;\n    std::cout << "Factorial of " << num << " is " << factorial(num) << std::endl;\n    return 0;\n}',
        },
        tldr: "Recursion is when a function calls itself to solve smaller instances of a problem. Always define a base case to stop recursion.",
    },
};

export const getTopicsList = (): TopicData[] => {
    return Object.entries(topicsData).map(([id, topic]) => ({
        id,
        ...topic,
    }));
};
