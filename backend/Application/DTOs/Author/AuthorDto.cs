namespace Application.DTOs.Author;

public class AuthorDto
{
    // dữ liệu trả về khi get
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Nationality { get; set; }
}

public class CreateAuthorDto
{
    // dữ liệu nhận khi tạo object mới ( không có thuộc tính Id, vì id sẽ được set tạo tự động )
    public string FullName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Nationality { get; set; }
}

public class UpdateAuthorDto
{
    // Dữ liệu nhận khi updated 
    public string FullName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Nationality { get; set; }
}
