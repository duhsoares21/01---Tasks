import { randomUUID } from 'node:crypto';
import {Database} from "./database.js";
import {buildRoutePath} from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (request, response) => {
            const title = request.body?.title ?? null;
            const description = request.body?.description ?? null;
            
            const message = {
                message: "Parâmetros title e description são obrigatórios"
            }
            
            if(title === null || description === null) {
                return response.writeHead(400).end(JSON.stringify(message));
            }
            
            const task = {
                id: randomUUID(),
                title: title,
                description: description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date()
            }

            database.insert('tasks', task);

            return response.writeHead(201).end();
        }
    },
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (request, response) => {
            const { search } = request.query; 

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search,
            } : null);
            
            return response.end(JSON.stringify(tasks));
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (request, response) => {
            const { id } = request.params;
            
            const title = request.body?.title ?? null;
            const description = request.body?.description ?? null;

            const message = {
                message: "É necessário enviar ao menos um parâmetro: title, description"
            }

            if(title === null && description === null) {
                return response.writeHead(400).end(JSON.stringify(message));
            }
            
            const selectedTask = database.select('tasks', '', id);
            
            const update = database.update('tasks', id, {
                title: title !== null ? title : selectedTask.title,
                description: description !== null ? description : selectedTask.description,
                completed_at: null,
                created_at: selectedTask.created_at,
                updated_at: new Date()
            });
            
            if(update) {
                response.writeHead(204).end();
            } else {
                const message = {
                    message: "ID não encontrado"
                }
                
                response.writeHead(404).end(JSON.stringify(message));
            }
            
        },
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (request, response) => {
            const { id } = request.params;
            
            const selectedTask = database.select('tasks', '', id);
            
            const update = database.update('tasks', id, {
                title: selectedTask.title,
                description: selectedTask.description,
                completed_at: selectedTask.completed_at !== null ? null : new Date(),
                created_at: selectedTask.created_at,
                updated_at: new Date()
            });

            if(update) {
                response.writeHead(204).end();
            } else {
                const message = {
                    message: "ID não encontrado"
                }

                response.writeHead(404).end(JSON.stringify(message));
            }
        },
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (request, response) => {
            const { id } = request.params;
            database.delete('tasks', id);
            response.writeHead(204).end();
        },
    }
]