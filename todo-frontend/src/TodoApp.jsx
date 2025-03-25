import React, { useState, useEffect } from "react";
import {
  Provider,
  defaultTheme,
  Flex,
  View,
  Heading,
  Button,
  Form,
  TextField,
  TextArea,
  Picker,
  Item,
  ProgressCircle,
  Text,
  Dialog,
  DialogTrigger,
  Content,
  Header,
  ButtonGroup,
  Well,
  IllustratedMessage,
} from "@adobe/react-spectrum";
import Add from "@spectrum-icons/workflow/Add";
import Alert from "@spectrum-icons/workflow/Alert";
import Calendar from "@spectrum-icons/workflow/Calendar";
import Edit from "@spectrum-icons/workflow/Edit";
import Delete from "@spectrum-icons/workflow/Delete";
import NotFound from "@spectrum-icons/illustrations/NotFound";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [currentTodo, setCurrentTodo] = useState({
    id: null,
    title: "",
    description: "",
    dueDate: null,
    priority: "Medium",
    isCompleted: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // "create" or "update"

  // GraphQL API endpoint
  const API_URL = "http://localhost:8080/graphql";

  const FETCH_TODOS_QUERY = `
    query {
      todos {
        nodes {
          id
          title
          description
          isCompleted
          createdAt
          updatedAt
          dueDate
          priority
        }
      }
    }
  `;

  const FETCH_TODO_QUERY = `
    query GetTodo($id: Int!) {
      todo(id: $id) {
        id
        title
        description
        isCompleted
        createdAt
        updatedAt
        dueDate
        priority
      }
    }
  `;

  const ADD_TODO_MUTATION = `
    mutation AddTodo($input: AddTodoInput!) {
      addTodo(input: $input) {
        id
        title
        description
        isCompleted
        createdAt
        updatedAt
        dueDate
        priority
      }
    }
  `;

  const UPDATE_TODO_MUTATION = `
    mutation UpdateTodo($input: UpdateTodoInput!) {
      updateTodo(input: $input) {
        id
        title
        description
        isCompleted
        createdAt
        updatedAt
        dueDate
        priority
      }
    }
  `;

  const COMPLETE_TODO_MUTATION = `
    mutation CompleteTodo($id: Int!) {
      completeTodoAsync(id: $id) {
        id
        isCompleted
        updatedAt
      }
    }
  `;

  const DELETE_TODO_MUTATION = `
    mutation DeleteTodo($id: Int!) {
      deleteTodoAsync(id: $id)
    }
  `;

  function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  const executeGraphQL = async (query, variables = {}) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors.map((e) => e.message).join(", "));
      }

      return data.data;
    } catch (err) {
      console.error("GraphQL Error:", err);
      throw err;
    }
  };

  // Fetch todos from API
  const fetchTodos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await executeGraphQL(FETCH_TODOS_QUERY);
      setTodos(data.todos.nodes);
    } catch (err) {
      setError(`Failed to load todos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single todo
  const fetchTodo = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await executeGraphQL(FETCH_TODO_QUERY, { id });
      const todo = data.todo;
      setCurrentTodo({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
      });
    } catch (err) {
      setError(`Failed to load todo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new todo
  const addTodo = async (todo) => {
    setIsLoading(true);
    setError(null);
    try {
      const variables = {
        input: {
          title: todo.title,
          description: todo.description || "",
          dueDate:
            todo.dueDate instanceof Date
              ? todo.dueDate.toISOString()
              : todo.dueDate,
          priority: todo.priority.toUpperCase(),
        },
      };

      const data = await executeGraphQL(ADD_TODO_MUTATION, variables);
      setTodos([...todos, data.addTodo]);
      setIsTodoModalOpen(false);
    } catch (err) {
      setError(`Failed to add todo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a todo
  const updateTodo = async (todo) => {
    setIsLoading(true);
    setError(null);
    try {
      const variables = {
        input: {
          id: todo.id,
          title: todo.title,
          description: todo.description,
          isCompleted: todo.isCompleted,
          dueDate:
            todo.dueDate instanceof Date
              ? todo.dueDate.toISOString()
              : todo.dueDate,
          priority: todo.priority.toUpperCase(),
        },
      };

      const data = await executeGraphQL(UPDATE_TODO_MUTATION, variables);
      setTodos(
        todos.map((t) => (t.id === data.updateTodo.id ? data.updateTodo : t))
      );

      setIsTodoModalOpen(false);
    } catch (err) {
      setError(`Failed to update todo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await executeGraphQL(DELETE_TODO_MUTATION, { id });
      if (result.deleteTodoAsync) {
        setTodos(todos.filter((todo) => todo.id !== id));
        setIsDeleteDialogOpen(false);
        setTodoToDelete(null);
      } else {
        setError("Failed to delete todo: Operation returned false");
      }
    } catch (err) {
      setError(`Failed to delete todo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Open todo modal for creating a new todo
  const openCreateModal = () => {
    setCurrentTodo({
      id: null,
      title: "",
      description: "",
      dueDate: null,
      priority: "Medium",
      isCompleted: false,
    });
    setModalMode("create");
    setIsTodoModalOpen(true);
  };

  // Open todo modal for updating an existing todo
  const openUpdateModal = async (todoId) => {
    await fetchTodo(todoId);
    setModalMode("update");
    setIsTodoModalOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (todo) => {
    setTodoToDelete(todo);
    setIsDeleteDialogOpen(true);
  };

  // Handle todo form submission
  const handleTodoSubmit = (e) => {
    e.preventDefault();
    if (!currentTodo.title.trim()) return;

    if (modalMode === "create") {
      addTodo(currentTodo);
    } else {
      updateTodo(currentTodo);
    }
  };

  // Add a more explicit style override for root element and modals
  const rootStyles = `
    :root, body, #root, #root > div {
      width: 100vw !important;
      max-width: 100vw !important;
      height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    #root > div > div {
      width: 100vw !important;
      max-width: 100vw !important;
    }

    .spectrum-Provider {
      width: 100vw !important;
      max-width: 100vw !important;
    }

    /* Modal styling fixes */
    .spectrum-Dialog-wrapper,
    .spectrum-Tray-wrapper,
    .spectrum-Modal-wrapper {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background-color: rgba(0, 0, 0, 0.5) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 9999 !important;
    }
    
    /* Prevent content from showing through modal */
    .spectrum-Provider--isDisabled {
      visibility: hidden !important;
    }
    
    /* Force the dialog to be visible and centered */
    .spectrum-Dialog, 
    .spectrum-Tray,
    .spectrum-Modal {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background-color: white !important;
      border-radius: 4px !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
      width: 480px !important;
      max-width: 90% !important;
      margin: 0 auto !important;
      z-index: 10000 !important;
    }

    /* Dialog content styling */
    .spectrum-Dialog-content,
    .spectrum-Modal-content,
    .spectrum-Tray-content {
      background-color: white !important;
      padding: 24px !important;
    }
    
    /* Modal header styling */
    .spectrum-Dialog-header,
    .spectrum-Modal-header,
    .spectrum-Tray-header {
      display: flex !important;
      justify-content: flex-start !important;
      align-items: center !important;
      border-bottom: 1px solid #e1e1e1 !important;
      padding: 16px 24px !important;
      background-color: white !important;
    }
    
    /* Modal footer styling - align buttons to the right */
    .spectrum-ButtonGroup {
      display: flex !important;
      justify-content: flex-end !important;
      margin-top: 24px !important;
    }
    
    /* Ensure the underlay/overlay is visible and properly styled */
    .spectrum-Underlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background-color: rgba(0, 0, 0, 0.5) !important;
      z-index: 9998 !important;
    }
    
    /* Fix form layout in modals */
    .spectrum-Form {
      width: 100% !important;
    }
    
    /* Hide any unexpected overflow */
    .spectrum-Dialog, 
    .spectrum-Tray,
    .spectrum-Modal,
    .spectrum-Dialog-content,
    .spectrum-Modal-content,
    .spectrum-Tray-content {
      overflow: hidden !important;
    }
  `;

  // Override modal layout instantly when component mounts
  useEffect(() => {
    // Create and insert custom CSS to fix modal positioning immediately
    const styleEl = document.createElement("style");
    styleEl.type = "text/css";
    styleEl.innerHTML = `
      /* Critical modal fixes - higher specificity to override defaults */
      .spectrum-Dialog-wrapper,
      .spectrum-Tray-wrapper,
      .spectrum-Modal-wrapper,
      div[role="dialog"] {
        background-color: rgba(0, 0, 0, 0.5) !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 9999 !important;
      }
      
      /* Force white background on all modal elements */
      .spectrum-Dialog,
      .spectrum-Tray,
      .spectrum-Modal,
      div[role="dialog"] > div,
      .spectrum-Dialog-content,
      .spectrum-Dialog-header {
        background-color: white !important;
      }
      
      /* Hide any form items that might be appearing outside the main form */
      body > div:not([role="dialog"]) > .spectrum-Form {
        display: none !important;
      }
      
      /* Fix button alignment */
      .spectrum-ButtonGroup {
        display: flex !important;
        justify-content: flex-end !important;
        margin-top: 16px !important;
      }
      
      /* Fix header alignment */
      .spectrum-Dialog-header > h3 {
        text-align: left !important;
        margin: 0 !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

  useEffect(() => {
    // Add global style to prevent scrolling on body
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.height = "100%";
    document.documentElement.style.width = "100%";

    // Create and append a style tag with our custom CSS
    const styleEl = document.createElement("style");
    styleEl.type = "text/css";
    styleEl.appendChild(document.createTextNode(rootStyles));
    document.head.appendChild(styleEl);

    // Fetch todos
    fetchTodos();

    // Cleanup function
    return () => {
      document.body.style.overflow = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.padding = "";
      document.documentElement.style.height = "";
      document.documentElement.style.width = "";
      document.head.removeChild(styleEl);
    };
  }, []);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";

    if (typeof date === "string") {
      date = new Date(date);
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if a due date is past
  const isPastDue = (dueDate) => {
    if (!dueDate) return false;

    if (typeof dueDate === "string") {
      dueDate = new Date(dueDate);
    }

    return dueDate < new Date();
  };

  // Get appropriate color variant based on priority
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "High":
        return "negative";
      case "Medium":
        return "notice";
      case "Low":
        return "positive";
      default:
        return "neutral";
    }
  };

  // Create a custom theme that expands to fill the available space
  const customTheme = {
    ...defaultTheme,
    global: {
      ...defaultTheme.global,
      scaling: {
        ...defaultTheme.global?.scaling,
        medium: 1, // Scale factor of 1 (default)
      },
    },
  };

  return (
    <Provider theme={customTheme} colorScheme="light">
      <View
        UNSAFE_style={{
          height: "100vh",
          width: "100vw",
          padding: "var(--spectrum-global-dimension-size-300)",
          overflow: "hidden",
          boxSizing: "border-box",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "var(--spectrum-global-color-gray-50)",
        }}
      >
        <Flex
          direction="column"
          width="100%"
          height="100%"
          gap="size-200"
          UNSAFE_style={{
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Flex
            justifyContent="space-between"
            alignItems="center"
            marginBottom="size-300"
          >
            <Heading level={1}>Todo Management</Heading>

            <Button
              variant="primary"
              isDisabled={isLoading}
              onPress={openCreateModal}
            >
              <Add />
              <Text>Add New Todo</Text>
            </Button>
          </Flex>

          {/* Error message */}
          {error && (
            <Well variant="negative">
              <Flex alignItems="center" gap="size-150">
                <Alert />
                <Text>{error}</Text>
                <View flex />
                <Button variant="negative" onPress={() => setError(null)}>
                  Dismiss
                </Button>
              </Flex>
            </Well>
          )}

          {/* Todo List */}
          <View
            flex
            UNSAFE_style={{ overflow: "auto", height: "calc(100vh - 150px)" }}
          >
            {isLoading && todos.length === 0 ? (
              <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <ProgressCircle
                  size="L"
                  aria-label="Loading todos"
                  isIndeterminate
                />
                <Text marginTop="size-200">Loading todos...</Text>
              </Flex>
            ) : todos.length === 0 ? (
              <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <IllustratedMessage>
                  <NotFound />
                  <Heading>No todos yet</Heading>
                  <Content>Add your first todo to get started!</Content>
                </IllustratedMessage>
              </Flex>
            ) : (
              <Flex
                direction="column"
                gap="size-200"
                width="100%"
                UNSAFE_style={{
                  paddingBottom: "var(--spectrum-global-dimension-size-300)",
                }}
              >
                {todos.map((todo) => (
                  <View
                    key={todo.id}
                    padding="size-300"
                    borderWidth="thin"
                    borderColor={todo.isCompleted ? "positive" : "default"}
                    borderRadius="medium"
                    backgroundColor={
                      todo.isCompleted ? "positive-100" : "gray-50"
                    }
                    width="100%"
                  >
                    <Flex direction="column" gap="size-150" width="100%">
                      <Checkbox isSelected={todo.isCompleted} isDisabled>
                        Completed
                      </Checkbox>
                      <Text
                        UNSAFE_style={{
                          textDecoration: todo.isCompleted
                            ? "line-through"
                            : "none",
                          fontWeight: "bold",
                          color: todo.isCompleted
                            ? "var(--spectrum-global-color-gray-600)"
                            : "inherit",
                        }}
                      >
                        {todo.title}
                      </Text>
                      {/* Header with title and priority */}
                      <Flex alignItems="center" gap="size-150" width="100%">
                        {/* Priority indicator - moved to the beginning */}

                        <Text
                          UNSAFE_style={{
                            textDecoration: todo.isCompleted
                              ? "line-through"
                              : "none",
                            fontWeight: "bold",
                            color: todo.isCompleted
                              ? "var(--spectrum-global-color-gray-600)"
                              : "inherit",
                          }}
                        >
                          {todo.title}
                        </Text>
                        <View
                          padding="size-50"
                          paddingX="size-150"
                          borderRadius="full"
                          backgroundColor={`${getPriorityVariant(
                            todo.priority
                          )}-100`}
                        >
                          <Text
                            UNSAFE_style={{
                              fontSize:
                                "var(--spectrum-global-dimension-font-size-75)",
                              fontWeight: "bold",
                              color: `var(--spectrum-semantic-${getPriorityVariant(
                                todo.priority
                              )}-color-900)`,
                            }}
                          >
                            Priority: {todo.priority}
                          </Text>
                        </View>
                        <View flex />

                        {/* Action buttons moved to far right */}
                        <ButtonGroup>
                          <Button
                            variant="primary"
                            isQuiet
                            onPress={() => openUpdateModal(todo.id)}
                            isDisabled={isLoading}
                          >
                            <Edit />
                            <Text>Edit</Text>
                          </Button>

                          <Button
                            variant="negative"
                            isQuiet
                            onPress={() => openDeleteDialog(todo)}
                            isDisabled={isLoading}
                          >
                            <Delete />
                            <Text>Delete</Text>
                          </Button>
                        </ButtonGroup>
                      </Flex>

                      {/* Description with label */}
                      {todo.description && (
                        <View
                          padding="size-100"
                          paddingX="size-200"
                          borderRadius="medium"
                          backgroundColor="gray-75"
                          marginTop="size-100"
                        >
                          <Text
                            UNSAFE_style={{
                              fontWeight: "bold",
                              fontSize:
                                "var(--spectrum-global-dimension-font-size-75)",
                            }}
                          >
                            Description:
                          </Text>
                          <Text
                            UNSAFE_style={{
                              color: todo.isCompleted
                                ? "var(--spectrum-global-color-gray-500)"
                                : "inherit",
                            }}
                          >
                            {todo.description}
                          </Text>
                        </View>
                      )}

                      {/* Metadata section */}
                      <Flex
                        marginTop="size-100"
                        gap="size-300"
                        UNSAFE_style={{
                          borderTop:
                            "1px solid var(--spectrum-global-color-gray-200)",
                          paddingTop:
                            "var(--spectrum-global-dimension-size-100)",
                        }}
                      >
                        <Flex alignItems="center" gap="size-75">
                          <Text
                            UNSAFE_style={{
                              fontSize:
                                "var(--spectrum-global-dimension-font-size-75)",
                              fontWeight: "bold",
                            }}
                          >
                            Created:
                          </Text>
                          <Text
                            UNSAFE_style={{
                              fontSize:
                                "var(--spectrum-global-dimension-font-size-75)",
                            }}
                          >
                            {formatDate(todo.createdAt)}
                          </Text>
                        </Flex>

                        <Flex alignItems="center" gap="size-75">
                          <Text
                            UNSAFE_style={{
                              fontSize:
                                "var(--spectrum-global-dimension-font-size-75)",
                              fontWeight: "bold",
                            }}
                          >
                            Updated:
                          </Text>
                          <Text
                            UNSAFE_style={{
                              fontSize:
                                "var(--spectrum-global-dimension-font-size-75)",
                            }}
                          >
                            {formatDate(todo.updatedAt)}
                          </Text>
                        </Flex>

                        {todo.dueDate && (
                          <Flex alignItems="center" gap="size-75">
                            <Calendar size="S" />
                            <Text
                              UNSAFE_style={{
                                fontSize:
                                  "var(--spectrum-global-dimension-font-size-75)",
                                fontWeight: "bold",
                              }}
                            >
                              Due:
                            </Text>
                            <Text
                              UNSAFE_style={{
                                fontSize:
                                  "var(--spectrum-global-dimension-font-size-75)",
                                color:
                                  isPastDue(todo.dueDate) && !todo.isCompleted
                                    ? "var(--spectrum-semantic-negative-color-900)"
                                    : "inherit",
                                fontWeight:
                                  isPastDue(todo.dueDate) && !todo.isCompleted
                                    ? "bold"
                                    : "normal",
                              }}
                            >
                              {formatDate(todo.dueDate)}
                            </Text>
                          </Flex>
                        )}
                      </Flex>
                    </Flex>
                  </View>
                ))}
              </Flex>
            )}
          </View>
        </Flex>
      </View>

      {/* Unified Todo Modal for Create/Update */}
      {isTodoModalOpen && (
        <Dialog
          onDismiss={() => setIsTodoModalOpen(false)}
          UNSAFE_className="todo-dialog"
          UNSAFE_style={{
            backgroundColor: "white",
            width: "480px",
            maxWidth: "90%",
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            overflow: "hidden",
          }}
        >
          <Header>
            <Heading level={3} UNSAFE_style={{ textAlign: "left" }}>
              {modalMode === "create" ? "Create New Todo" : "Edit Todo"}
            </Heading>
          </Header>
          <Content UNSAFE_style={{ backgroundColor: "white", padding: "24px" }}>
            <Form
              onSubmit={handleTodoSubmit}
              isRequired
              necessityIndicator="icon"
              UNSAFE_style={{ width: "100%" }}
            >
              <TextField
                label="Title"
                value={currentTodo.title}
                onChange={(value) =>
                  setCurrentTodo({ ...currentTodo, title: value })
                }
                maxLength={100}
                isRequired
                autoFocus
              />

              <TextArea
                label="Description"
                value={currentTodo.description || ""}
                onChange={(value) =>
                  setCurrentTodo({ ...currentTodo, description: value })
                }
              />

              <Flex gap="size-150">
                <Picker
                  label="Priority"
                  selectedKey={capitalizeFirstLetter(currentTodo.priority)}
                  onSelectionChange={(selected) =>
                    setCurrentTodo({ ...currentTodo, priority: selected })
                  }
                >
                  <Item key="Low">Low</Item>
                  <Item key="Medium">Medium</Item>
                  <Item key="High">High</Item>
                </Picker>
              </Flex>

              <Flex alignItems="end" gap="size-150">
                <View flex>
                  <TextField
                    label="Due Date"
                    type="date"
                    value={
                      currentTodo.dueDate
                        ? typeof currentTodo.dueDate === "string"
                          ? new Date(currentTodo.dueDate)
                              .toISOString()
                              .split("T")[0]
                          : currentTodo.dueDate.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(value) => {
                      if (value) {
                        const date = new Date(value);
                        setCurrentTodo({ ...currentTodo, dueDate: date });
                      } else {
                        setCurrentTodo({ ...currentTodo, dueDate: null });
                      }
                    }}
                  />
                </View>
              </Flex>

              <ButtonGroup
                UNSAFE_style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "24px",
                }}
              >
                <Button
                  variant="secondary"
                  onPress={() => setIsTodoModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="cta"
                  type="submit"
                  isDisabled={!currentTodo.title.trim() || isLoading}
                >
                  {isLoading
                    ? modalMode === "create"
                      ? "Adding..."
                      : "Saving..."
                    : modalMode === "create"
                    ? "Add Todo"
                    : "Save Todo"}
                </Button>
              </ButtonGroup>
            </Form>
          </Content>
        </Dialog>
      )}

      {/* Delete Todo Confirmation Dialog */}
      {isDeleteDialogOpen && todoToDelete && (
        <Dialog
          onDismiss={() => {
            setIsDeleteDialogOpen(false);
            setTodoToDelete(null);
          }}
          UNSAFE_style={{
            backgroundColor: "white",
            width: "480px",
            maxWidth: "90%",
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            overflow: "hidden",
          }}
        >
          <Header>
            <Heading level={3} UNSAFE_style={{ textAlign: "left" }}>
              Confirm Delete
            </Heading>
          </Header>
          <Content UNSAFE_style={{ backgroundColor: "white", padding: "24px" }}>
            <Flex direction="column" gap="size-200">
              <Text>
                Are you sure you want to delete "{todoToDelete.title}"?
              </Text>
              <Text>This action cannot be undone.</Text>
              <ButtonGroup
                UNSAFE_style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "24px",
                }}
              >
                <Button
                  variant="secondary"
                  onPress={() => {
                    setIsDeleteDialogOpen(false);
                    setTodoToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="negative"
                  onPress={() => deleteTodo(todoToDelete.id)}
                  isDisabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete Todo"}
                </Button>
              </ButtonGroup>
            </Flex>
          </Content>
        </Dialog>
      )}
    </Provider>
  );
};

export default TodoApp;
