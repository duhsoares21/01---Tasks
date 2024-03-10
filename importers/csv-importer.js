import { generate } from 'csv-generate';
import { parse } from 'csv-parse';

(async () => {
    const parser = generate({
        columns: ['ascii', 'ascii'],
        length: 6
    }).pipe(
        parse()
    );
    
    process.stdout.write('start\n');
    
    let title, description;
    
    let index = 0;
    
    for await (const record of parser) {
        
        if(index > 0) {
            title = record[0];
            description = record[1];
            
            const data = {
                title: title,
                description: description
            }
            
            const response = await fetch('http://localhost:9000/tasks', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(data),
                duplex: 'half'
            });
        }
        
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        index++;
    }
    
    // Report end
    process.stdout.write('...done\n');
})();